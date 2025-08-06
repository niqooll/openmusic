const path = require('path');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: handler.postAlbumHandler,
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: handler.getAlbumByIdHandler,
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: handler.putAlbumByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: handler.deleteAlbumByIdHandler,
  },
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: handler.postAlbumLikeHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: handler.getAlbumLikesHandler,
  },
  {
    method: 'DELETE',
    path: '/albums/{id}/likes',
    handler: handler.deleteAlbumLikeHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'POST',
    path: '/albums/{id}/covers',
    handler: handler.postUploadCoverHandler,
    options: {
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: 1048576, // 1MB (lebih besar dari 512KB untuk menghindari early rejection)
        timeout: 30000, // 30 detik timeout
        allow: 'multipart/form-data', // Pastikan hanya menerima multipart
      },
    },
  },
  {
    method: 'GET',
    path: '/uploads/images/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, 'file/images'),
        redirectToSlash: true,
        index: false,
      },
    },
  },
];

module.exports = routes;