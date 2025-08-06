const ClientError = require('../exceptions/ClientError');

const createErrorResponse = (h, error) => {
  if (error instanceof ClientError) {
    const response = h.response({
      status: 'fail',
      message: error.message,
    });
    response.code(error.statusCode);
    return response;
  }

  // Server error
  const response = h.response({
    status: 'error',
    message: 'Maaf, terjadi kegagalan pada server kami.',
  });
  response.code(500);
  return response;
};

const handleValidationError = (h, validationError) => {
  const response = h.response({
    status: 'fail',
    message: validationError.message,
  });
  response.code(400);
  return response;
};

module.exports = {
  createErrorResponse,
  handleValidationError,
};