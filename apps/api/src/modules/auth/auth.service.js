const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const { getSupabaseAdmin } = require('../../config/supabase');

const SALT_ROUNDS = 12;

function ensureJwtSecret() {
    if (!process.env.JWT_SECRET) {
        const error = new Error('Missing JWT_SECRET in environment variables');
        error.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        throw error;
    }
}

function signAccessToken(user) {
    ensureJwtSecret();
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role,
            type: 'access',
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '24h',
            algorithm: 'HS256',
        }
    );
}

function signRefreshToken(user) {
    ensureJwtSecret();
    return jwt.sign(
        {
            sub: user.id,
            type: 'refresh',
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
            algorithm: 'HS256',
        }
    );
}

function sanitizeUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar_url: user.avatar_url,
        last_login_at: user.last_login_at,
        created_at: user.created_at,
        updated_at: user.updated_at,
    };
}

async function register(payload) {
    const supabaseAdmin = getSupabaseAdmin();

    const email = payload.email.toLowerCase();

    const { data: existingUser, error: existingUserError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

    if (existingUserError) {
        existingUserError.statusCode = StatusCodes.BAD_REQUEST;
        throw existingUserError;
    }

    if (existingUser) {
        const error = new Error('Email is already registered');
        error.statusCode = StatusCodes.CONFLICT;
        throw error;
    }

    const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);

    const { data: user, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
            name: payload.name,
            email,
            password_hash: passwordHash,
            role: 'viewer',
            status: 'active',
        })
        .select('id, name, email, role, status, avatar_url, last_login_at, created_at, updated_at')
        .single();

    if (createError) {
        if (createError.code === '23505') {
            const conflictError = new Error('Email is already registered');
            conflictError.statusCode = StatusCodes.CONFLICT;
            throw conflictError;
        }
        createError.statusCode = StatusCodes.BAD_REQUEST;
        throw createError;
    }

    const token = signAccessToken(user);

    return {
        token,
        refreshToken: signRefreshToken(user),
        user: sanitizeUser(user),
    };
}

async function login(payload) {
    const supabaseAdmin = getSupabaseAdmin();

    const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', payload.email.toLowerCase())
        .maybeSingle();

    if (error) {
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    if (!user) {
        const authError = new Error('Invalid email or password');
        authError.statusCode = StatusCodes.UNAUTHORIZED;
        throw authError;
    }

    if (user.status !== 'active') {
        const statusError = new Error('Your account is inactive. Contact administrator');
        statusError.statusCode = StatusCodes.FORBIDDEN;
        throw statusError;
    }

    const passwordMatch = await bcrypt.compare(payload.password, user.password_hash);

    if (!passwordMatch) {
        const authError = new Error('Invalid email or password');
        authError.statusCode = StatusCodes.UNAUTHORIZED;
        throw authError;
    }

    const { data: updatedUser } = await supabaseAdmin
        .from('users')
        .update({ last_login_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select('id, name, email, role, status, avatar_url, last_login_at, created_at, updated_at')
        .single();

    const userForToken = updatedUser || user;

    return {
        token: signAccessToken(userForToken),
        refreshToken: signRefreshToken(userForToken),
        user: sanitizeUser(userForToken),
    };
}

async function getMe(userId) {
    const supabaseAdmin = getSupabaseAdmin();

    const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('id, name, email, role, status, avatar_url, last_login_at, created_at, updated_at')
        .eq('id', userId)
        .single();

    if (error) {
        error.statusCode = StatusCodes.NOT_FOUND;
        throw error;
    }

    return sanitizeUser(user);
}

async function updateMe(userId, payload) {
    const supabaseAdmin = getSupabaseAdmin();

    const updateData = {
        updated_at: new Date().toISOString(),
    };

    if (typeof payload.name === 'string') {
        updateData.name = payload.name;
    }

    if (payload.avatar_url !== undefined) {
        updateData.avatar_url = payload.avatar_url;
    }

    const { data: user, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select('id, name, email, role, status, avatar_url, last_login_at, created_at, updated_at')
        .single();

    if (error) {
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    return sanitizeUser(user);
}

async function changePassword(userId, payload) {
    const supabaseAdmin = getSupabaseAdmin();

    const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, password_hash')
        .eq('id', userId)
        .single();

    if (userError) {
        userError.statusCode = StatusCodes.NOT_FOUND;
        throw userError;
    }

    const isMatch = await bcrypt.compare(payload.current_password, user.password_hash);

    if (!isMatch) {
        const error = new Error('Current password is incorrect');
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    const newPasswordHash = await bcrypt.hash(payload.new_password, SALT_ROUNDS);

    const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
            password_hash: newPasswordHash,
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

    if (updateError) {
        updateError.statusCode = StatusCodes.BAD_REQUEST;
        throw updateError;
    }

    return { success: true };
}

function refreshAccessToken(refreshToken) {
    ensureJwtSecret();

    let payload;
    try {
        payload = jwt.verify(refreshToken, process.env.JWT_SECRET, {
            algorithms: ['HS256'],
        });
    } catch (_error) {
        const error = new Error('Invalid or expired refresh token');
        error.statusCode = StatusCodes.UNAUTHORIZED;
        throw error;
    }

    if (payload.type !== 'refresh') {
        const error = new Error('Invalid refresh token');
        error.statusCode = StatusCodes.UNAUTHORIZED;
        throw error;
    }

    const newAccessToken = jwt.sign(
        {
            sub: payload.sub,
            type: 'access',
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '24h',
            algorithm: 'HS256',
        }
    );

    return {
        token: newAccessToken,
    };
}

function logout() {
    return { success: true };
}

module.exports = {
    register,
    login,
    getMe,
    updateMe,
    changePassword,
    refreshAccessToken,
    logout,
};
