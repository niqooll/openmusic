const Joi = require('joi');

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear())
    .required(),
});

// Schema untuk validasi image headers yang lebih ketat
const ImageHeadersSchema = Joi.object({
  'content-type': Joi.string().valid(
    'image/apng',
    'image/avif', 
    'image/gif',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/svg+xml',
    'image/webp'
  ).required(),
  'content-length': Joi.number().max(512000).optional(), // max 512KB
}).unknown(); // Allow other headers

module.exports = { AlbumPayloadSchema, ImageHeadersSchema };