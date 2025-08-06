const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const ClientError = require('../../exceptions/ClientError');
const { createPool } = require('../../utils/database');

class AlbumsService {
  constructor(cacheService) {
    this._pool = createPool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums (id, name, year) VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT id, name, year, cover FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const album = result.rows[0];
    // DIUBAH: Membuat properti coverUrl
    return {
      id: album.id,
      name: album.name,
      year: album.year,
      coverUrl: album.cover,
    };
  }

  async getAlbumWithSongs(id) {
    const album = await this.getAlbumById(id);
    const songsQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };
    const songsResult = await this._pool.query(songsQuery);
    album.songs = songsResult.rows;
    return album;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };
    const result = await this._pool.query(query);
    if (result.rows.length === 0) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async addAlbumLike(albumId, userId) {
    // Verifikasi album ada
    await this.getAlbumById(albumId);

    // Verifikasi apakah user sudah like sebelumnya
    const checkQuery = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    const checkResult = await this._pool.query(checkQuery);
    if (checkResult.rows.length > 0) {
      throw new ClientError('Anda sudah menyukai album ini', 400);
    }

    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes (id, user_id, album_id) VALUES ($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menyukai album');
    }

    // Hapus cache karena data likes berubah
    await this._cacheService.delete(`album-likes:${albumId}`);
  }

  async deleteAlbumLike(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Gagal batal menyukai album');
    }

    // Hapus cache karena data likes berubah
    await this._cacheService.delete(`album-likes:${albumId}`);
  }

  async getAlbumLikesCount(albumId) {
    try {
      // Coba dapatkan dari cache dulu
      const result = await this._cacheService.get(`album-likes:${albumId}`);
      return { count: JSON.parse(result), isCache: true };
    } catch (error) {
      // Jika gagal (cache miss), ambil dari database
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };
      const result = await this._pool.query(query);
      const likesCount = parseInt(result.rows[0].count, 10);

      // Simpan ke cache
      await this._cacheService.set(`album-likes:${albumId}`, JSON.stringify(likesCount));

      return { count: likesCount, isCache: false };
    }
  }

  // --- METHOD BARU ---
  async addCoverToAlbum(id, fileUrl) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [fileUrl, id],
    };
    const result = await this._pool.query(query);
    if (result.rows.length === 0) {
      throw new NotFoundError('Gagal memperbarui sampul. Album tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;