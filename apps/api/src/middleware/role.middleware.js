const { StatusCodes } = require('http-status-codes');

function allowRoles(...allowedRoles) {
    return (req, _res, next) => {
        if (!req.user) {
            const error = new Error('Unauthorized');
            error.statusCode = StatusCodes.UNAUTHORIZED;
            return next(error);
        }

        if (!allowedRoles.includes(req.user.role)) {
            const error = new Error('Access denied');
            error.statusCode = StatusCodes.FORBIDDEN;
            return next(error);
        }

        return next();
    };
}

module.exports = {
    allowRoles,
};
