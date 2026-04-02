function successResponse(
    res,
    {
        statusCode = 200,
        message = 'Request completed successfully',
        data = null,
        meta = undefined,
    } = {}
) {
    const payload = {
        success: true,
        message,
        data,
    };

    if (meta !== undefined) {
        payload.meta = meta;
    }

    return res.status(statusCode).json(payload);
}

function errorResponse(
    res,
    {
        statusCode = 500,
        message = 'Something went wrong',
        errors = undefined,
    } = {}
) {
    const payload = {
        success: false,
        message,
    };

    if (errors !== undefined) {
        payload.errors = errors;
    }

    return res.status(statusCode).json(payload);
}

module.exports = {
    successResponse,
    errorResponse,
};
