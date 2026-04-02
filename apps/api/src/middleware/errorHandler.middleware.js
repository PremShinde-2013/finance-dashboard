const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');
const { errorResponse } = require('../utils/apiResponse');

function notFoundHandler(req, res) {
    return errorResponse(res, {
        statusCode: StatusCodes.NOT_FOUND,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
}

function errorHandler(err, _req, res, _next) {
    const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

    logger.error(err);

    return errorResponse(res, {
        statusCode,
        message: err.message || 'Internal server error',
        errors: err.errors || undefined,
    });
}

module.exports = {
    notFoundHandler,
    errorHandler,
};
