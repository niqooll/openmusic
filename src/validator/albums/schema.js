const Joi = require('joi');

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear())
    .required(),
});

// Schema untuk validasi image headers
const ImageHeadersSchema = Joi.object({
  'content-type': Joi.string().valid(
    'image/apng',
    'image/avif', 
    'image/gif',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ).required().messages({
    'any.only': 'File harus berupa gambar',
  }),
  'content-length': Joi.number().max(512000).optional().messages({
    'number.max': 'Ukuran gambar terlalu besar',
  }), 
}).unknown();

module.exports = { AlbumPayloadSchema, ImageHeadersSchema };