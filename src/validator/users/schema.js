const Joi = require('joi');

const UserPayloadSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  password: Joi.string().min(8).required(),
  fullname: Joi.string().max(100).required(),
});

module.exports = { UserPayloadSchema };