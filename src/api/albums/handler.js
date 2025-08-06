const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, storageService, validator) {
    this._service = service;
    this._storageService = storageService;
    this._validator = validator;
    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumWithSongs(id);

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postAlbumLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.addAlbumLike(albumId, userId);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menyukai album',
    });
    response.code(201);
    return response;
  }

  async getAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;
    const { count, isCache } = await this._service.getAlbumLikesCount(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes: count,
      },
    });

    if (isCache) {
      response.header('X-Data-Source', 'cache');
    }
    return response;
  }

  async deleteAlbumLikeHandler(request) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.deleteAlbumLike(albumId, userId);
    return {
      status: 'success',
      message: 'Batal menyukai album berhasil',
    };
  }

  async postUploadCoverHandler(request, h) {
    try {
      const { id: albumId } = request.params;
      
      // Verifikasi album exists
      await this._service.getAlbumById(albumId);

      // Check if payload and cover exist
      if (!request.payload || !request.payload.cover) {
        const response = h.response({
          status: 'fail',
          message: 'Cover file is required',
        });
        response.code(400);
        return response;
      }

      const { cover } = request.payload;

      // Validasi headers
      if (!cover.hapi || !cover.hapi.headers) {
        const response = h.response({
          status: 'fail',
          message: 'Invalid file format',
        });
        response.code(415);
        return response;
      }

      const contentType = cover.hapi.headers['content-type'];
      
      // Check content type
      const allowedTypes = [
        'image/apng',
        'image/avif',
        'image/gif', 
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
      ];

      if (!allowedTypes.includes(contentType)) {
        const response = h.response({
          status: 'fail',
          message: 'File type not supported. Only image files are allowed.',
        });
        response.code(415);
        return response;
      }

      // Validate file size (max 512KB)
      const maxSize = 512000;
      let fileSize = 0;

      if (cover.hapi.headers['content-length']) {
        fileSize = parseInt(cover.hapi.headers['content-length'], 10);
      }

      if (fileSize > maxSize) {
        const response = h.response({
          status: 'fail',
          message: 'File size too large. Maximum size is 512KB.',
        });
        response.code(413);
        return response;
      }

      // Save file
      const filename = await this._storageService.writeFile(cover, cover.hapi);
      const fileUrl = `http://${process.env.HOST}:${process.env.PORT}/uploads/images/${filename}`;
      await this._service.addCoverToAlbum(albumId, fileUrl);

      const response = h.response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
      });
      response.code(201);
      return response;

    } catch (error) {
      throw error;
    }
  }
}

module.exports = AlbumsHandler;