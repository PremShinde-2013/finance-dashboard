const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const { getSupabaseAdmin } = require('../config/supabase');

async function authMiddleware(req, _res, next) {
    try {
        const authHeader = req.headers.authorization || '';

        if (!authHeader.startsWith('Bearer ')) {
            const error = new Error('Authorization token is required');
            error.statusCode = StatusCodes.UNAUTHORIZED;
            return next(error);
        }

        const token = authHeader.split(' ')[1];

        if (!process.env.JWT_SECRET) {
            const error = new Error('Missing JWT_SECRET in environment variables');
            error.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
            return next(error);
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256'],
        });

        const supabaseAdmin = getSupabaseAdmin();
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, name, email, role, status, avatar_url, last_login_at, created_at, updated_at')
            .eq('id', payload.sub)
            .single();

        if (userError || !user) {
            const error = new Error('Invalid or expired token');
            error.statusCode = StatusCodes.UNAUTHORIZED;
            return next(error);
        }

        if (user.status !== 'active') {
            const error = new Error('Your account is inactive. Contact administrator');
            error.statusCode = StatusCodes.FORBIDDEN;
            return next(error);
        }

        req.user = user;
        return next();
    } catch (_error) {
        const error = new Error('Invalid or expired token');
        error.statusCode = StatusCodes.UNAUTHORIZED;
        return next(error);
    }
}

module.exports = authMiddleware;
