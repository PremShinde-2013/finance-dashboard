const { validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');

function validateRequest(req, _res, next) {
    const result = validationResult(req);

    if (result.isEmpty()) {
        return next();
    }

    const error = new Error('Validation failed');
    error.statusCode = StatusCodes.BAD_REQUEST;
    error.errors = result.array().map((issue) => ({
        field: issue.path,
        message: issue.msg,
    }));

    return next(error);
}

module.exports = validateRequest;
