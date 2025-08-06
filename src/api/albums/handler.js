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
    const { id: albumId } = request.params;
    
    try {
      // 1. Verify album exists first
      await this._service.getAlbumById(albumId);
      
      // 2. Check if payload exists
      if (!request.payload) {
        const response = h.response({
          status: 'fail',
          message: 'Payload harus diisi',
        });
        response.code(400);
        return response;
      }

      const { cover } = request.payload;
      
      // 3. Check if cover field exists
      if (!cover) {
        const response = h.response({
          status: 'fail',
          message: 'Cover harus diisi',
        });
        response.code(400);
        return response;
      }

      // 4. Validate content type dari headers
      if (!cover.hapi || !cover.hapi.headers) {
        const response = h.response({
          status: 'fail',
          message: 'File tidak valid',
        });
        response.code(400);
        return response;
      }

      const contentType = cover.hapi.headers['content-type'];
      const allowedTypes = [
        'image/apng',
        'image/avif',
        'image/gif',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
      ];

      if (!contentType || !allowedTypes.includes(contentType)) {
        const response = h.response({
          status: 'fail',
          message: 'File harus berupa gambar',
        });
        response.code(400);
        return response;
      }

      // 5. Process upload - StorageService will handle file size validation
      const filename = await this._storageService.writeFile(cover, cover.hapi);
      const fileUrl = `http://${process.env.HOST}:${process.env.PORT}/uploads/images/${filename}`;

      // 6. Update album with cover URL
      await this._service.addCoverToAlbum(albumId, fileUrl);

      const response = h.response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
      });
      response.code(201);
      return response;

    } catch (error) {
      // Handle file size errors specifically
      if (error.message && error.message.includes('Payload content length greater than')) {
        const response = h.response({
          status: 'fail',
          message: 'Payload content length greater than maximum allowed: 512000',
        });
        response.code(413);
        return response;
      }

      if (error.message && error.message.includes('File size exceeds')) {
        const response = h.response({
          status: 'fail',
          message: 'Payload content length greater than maximum allowed: 512000',
        });
        response.code(413);
        return response;
      }

      // Re-throw other errors for global handler
      throw error;
    }
  }
}

module.exports = AlbumsHandler;