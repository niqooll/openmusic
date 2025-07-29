const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`;

    // Validasi albumId jika disediakan dan tidak kosong
    if (albumId && albumId.trim() !== '') {
      const albumQuery = {
        text: 'SELECT id FROM albums WHERE id = $1',
        values: [albumId],
      };
      
      const albumResult = await this._pool.query(albumQuery);
      
      if (!albumResult.rows.length) {
        throw new InvariantError('Album tidak ditemukan');
      }
    }

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [
        id, 
        title, 
        year, 
        genre, 
        performer, 
        duration || null, 
        (albumId && albumId.trim() !== '') ? albumId : null
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    let query = 'SELECT id, title, performer FROM songs';
    const conditions = [];
    const values = [];

    if (title) {
      conditions.push(`title ILIKE $${conditions.length + 1}`);
      values.push(`%${title}%`);
    }

    if (performer) {
      conditions.push(`performer ILIKE $${conditions.length + 1}`);
      values.push(`%${performer}%`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const result = await this._pool.query({
      text: query,
      values,
    });

    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    const song = result.rows[0];
    
    return {
      id: song.id,
      title: song.title,
      year: song.year,
      performer: song.performer,
      genre: song.genre,
      duration: song.duration,
      albumId: song.album_id,
    };
  }

  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    // Validasi albumId jika disediakan
    if (albumId) {
      const albumQuery = {
        text: 'SELECT id FROM albums WHERE id = $1',
        values: [albumId],
      };
      
      const albumResult = await this._pool.query(albumQuery);
      
      if (!albumResult.rows.length) {
        throw new InvariantError('Album tidak ditemukan');
      }
    }

    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId || null, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;