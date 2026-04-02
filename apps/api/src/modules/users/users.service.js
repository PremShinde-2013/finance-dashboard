const bcrypt = require('bcryptjs');
const { StatusCodes } = require('http-status-codes');

const { getSupabaseAdmin } = require('../../config/supabase');
const { parsePagination, getPaginationMeta } = require('../../utils/pagination');

const SALT_ROUNDS = 12;

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

async function listUsers(query) {
    const supabaseAdmin = getSupabaseAdmin();
    const { page, limit, from, to } = parsePagination(query);

    let request = supabaseAdmin
        .from('users')
        .select('id, name, email, role, status, avatar_url, last_login_at, created_at, updated_at', { count: 'exact' });

    if (query.role) {
        request = request.eq('role', query.role);
    }

    if (query.status) {
        request = request.eq('status', query.status);
    }

    if (query.search) {
        request = request.or(`name.ilike.%${query.search}%,email.ilike.%${query.search}%`);
    }

    const { data, error, count } = await request.order('created_at', { ascending: false }).range(from, to);

    if (error) {
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    return {
        data: data.map(sanitizeUser),
        meta: getPaginationMeta({ page, limit, total: count || 0 }),
    };
}

async function getUserById(id) {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
        .from('users')
        .select('id, name, email, role, status, avatar_url, last_login_at, created_at, updated_at')
        .eq('id', id)
        .single();

    if (error) {
        error.statusCode = StatusCodes.NOT_FOUND;
        throw error;
    }

    return sanitizeUser(data);
}

async function createUser(payload) {
    const supabaseAdmin = getSupabaseAdmin();

    const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', payload.email.toLowerCase())
        .maybeSingle();

    if (existingUser) {
        const error = new Error('Email is already registered');
        error.statusCode = StatusCodes.CONFLICT;
        throw error;
    }

    const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);

    const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
            name: payload.name,
            email: payload.email.toLowerCase(),
            password_hash: passwordHash,
            role: payload.role || 'viewer',
            status: payload.status || 'active',
            avatar_url: payload.avatar_url || null,
        })
        .select('id, name, email, role, status, avatar_url, last_login_at, created_at, updated_at')
        .single();

    if (error) {
        if (error.code === '23505') {
            const conflictError = new Error('Email is already registered');
            conflictError.statusCode = StatusCodes.CONFLICT;
            throw conflictError;
        }
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    return sanitizeUser(data);
}

async function updateUser(id, payload) {
    const supabaseAdmin = getSupabaseAdmin();

    if (payload.email) {
        const { data: existing } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', payload.email.toLowerCase())
            .maybeSingle();

        if (existing && existing.id !== id) {
            const conflictError = new Error('Email is already registered');
            conflictError.statusCode = StatusCodes.CONFLICT;
            throw conflictError;
        }
    }

    const updateData = {
        updated_at: new Date().toISOString(),
    };

    ['name', 'email', 'role', 'status', 'avatar_url'].forEach((field) => {
        if (payload[field] !== undefined) {
            updateData[field] = field === 'email' ? payload[field].toLowerCase() : payload[field];
        }
    });

    const { data, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select('id, name, email, role, status, avatar_url, last_login_at, created_at, updated_at')
        .single();

    if (error) {
        if (error.code === '23505') {
            const conflictError = new Error('Email is already registered');
            conflictError.statusCode = StatusCodes.CONFLICT;
            throw conflictError;
        }
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    return sanitizeUser(data);
}

async function updateRole(id, role) {
    return updateUser(id, { role });
}

async function updateStatus(id, status) {
    return updateUser(id, { status });
}

async function softDeleteUser(id) {
    return updateUser(id, { status: 'inactive' });
}

async function hardDeleteUser(id) {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', id)
        .select('id, name, email, role, status, avatar_url, last_login_at, created_at, updated_at')
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            const notFoundError = new Error('User not found');
            notFoundError.statusCode = StatusCodes.NOT_FOUND;
            throw notFoundError;
        }

        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    return sanitizeUser(data);
}

module.exports = {
    listUsers,
    getUserById,
    createUser,
    updateUser,
    updateRole,
    updateStatus,
    softDeleteUser,
    hardDeleteUser,
};
