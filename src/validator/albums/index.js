const { AlbumPayloadSchema, ImageHeadersSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const AlbumsValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  
  validateImageHeaders: (headers) => {
    const validationResult = ImageHeadersSchema.validate(headers);

    if (validationResult.error) {
      // Map specific validation errors to appropriate messages
      const errorMessage = validationResult.error.details[0].message;
      
      if (errorMessage.includes('File harus berupa gambar')) {
        throw new InvariantError('File harus berupa gambar');
      }
      
      if (errorMessage.includes('Ukuran gambar terlalu besar')) {
        throw new InvariantError('Ukuran gambar terlalu besar');
      }
      
      throw new InvariantError(errorMessage);
    }
  },
};

module.exports = AlbumsValidator;