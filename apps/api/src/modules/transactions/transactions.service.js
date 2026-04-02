const { StatusCodes } = require('http-status-codes');

const { getSupabaseAdmin } = require('../../config/supabase');
const { parsePagination, getPaginationMeta } = require('../../utils/pagination');

const ALLOWED_SORT_COLUMNS = ['date', 'amount', 'created_at', 'updated_at', 'type'];

function applyListFilters(queryBuilder, filters = {}) {
    let request = queryBuilder;

    if (filters.type) {
        request = request.eq('type', filters.type);
    }

    if (filters.category_id) {
        request = request.eq('category_id', filters.category_id);
    }

    if (filters.start_date) {
        request = request.gte('date', filters.start_date);
    }

    if (filters.end_date) {
        request = request.lte('date', filters.end_date);
    }

    if (filters.min_amount) {
        request = request.gte('amount', Number(filters.min_amount));
    }

    if (filters.max_amount) {
        request = request.lte('amount', Number(filters.max_amount));
    }

    if (filters.tags) {
        const tagList = Array.isArray(filters.tags)
            ? filters.tags
            : String(filters.tags)
                .split(',')
                .map((value) => value.trim())
                .filter(Boolean);

        if (tagList.length > 0) {
            request = request.overlaps('tags', tagList);
        }
    }

    if (filters.search) {
        request = request.or(`description.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
    }

    return request;
}

async function listTransactions(query, currentUser) {
    const supabaseAdmin = getSupabaseAdmin();
    const { page, limit, from, to } = parsePagination(query);

    let request = supabaseAdmin
        .from('transactions')
        .select(
            'id, user_id, category_id, amount, type, date, description, notes, tags, is_deleted, deleted_at, created_by, updated_by, created_at, updated_at, categories(name, type, color, icon)',
            { count: 'exact' }
        );

    if (query.include_deleted === 'true') {
        if (currentUser.role !== 'admin') {
            const error = new Error('Only admin can access deleted transactions');
            error.statusCode = StatusCodes.FORBIDDEN;
            throw error;
        }
    } else {
        request = request.eq('is_deleted', false);
    }

    request = applyListFilters(request, query);

    const sortBy = ALLOWED_SORT_COLUMNS.includes(query.sort_by) ? query.sort_by : 'date';
    const ascending = String(query.sort_order || 'desc').toLowerCase() === 'asc';

    const { data, error, count } = await request.order(sortBy, { ascending }).range(from, to);

    if (error) {
        if (error.code === '23503') {
            const referenceError = new Error('Referenced user or category does not exist');
            referenceError.statusCode = StatusCodes.BAD_REQUEST;
            throw referenceError;
        }
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    return {
        data,
        meta: getPaginationMeta({ page, limit, total: count || 0 }),
    };
}

async function getTransactionById(id, includeDeleted = true) {
    const supabaseAdmin = getSupabaseAdmin();

    let request = supabaseAdmin
        .from('transactions')
        .select(
            'id, user_id, category_id, amount, type, date, description, notes, tags, is_deleted, deleted_at, created_by, updated_by, created_at, updated_at, categories(name, type, color, icon)'
        )
        .eq('id', id);

    if (!includeDeleted) {
        request = request.eq('is_deleted', false);
    }

    const { data, error } = await request.single();

    if (error) {
        error.statusCode = StatusCodes.NOT_FOUND;
        throw error;
    }

    return data;
}

async function createTransaction(payload, currentUser) {
    const supabaseAdmin = getSupabaseAdmin();

    const body = {
        user_id: payload.user_id || currentUser.id,
        category_id: payload.category_id || null,
        amount: Number(payload.amount),
        type: payload.type,
        date: payload.date,
        description: payload.description || null,
        notes: payload.notes || null,
        tags: payload.tags || [],
        is_deleted: false,
        created_by: currentUser.id,
        updated_by: currentUser.id,
    };

    const { data, error } = await supabaseAdmin
        .from('transactions')
        .insert(body)
        .select(
            'id, user_id, category_id, amount, type, date, description, notes, tags, is_deleted, deleted_at, created_by, updated_by, created_at, updated_at, categories(name, type, color, icon)'
        )
        .single();

    if (error) {
        if (error.code === '23503') {
            const referenceError = new Error('Referenced user or category does not exist');
            referenceError.statusCode = StatusCodes.BAD_REQUEST;
            throw referenceError;
        }
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    return data;
}

async function updateTransaction(id, payload, currentUser) {
    const supabaseAdmin = getSupabaseAdmin();

    const updateData = {
        updated_at: new Date().toISOString(),
        updated_by: currentUser.id,
    };

    ['category_id', 'type', 'date', 'description', 'notes', 'tags'].forEach((field) => {
        if (payload[field] !== undefined) {
            updateData[field] = payload[field];
        }
    });

    if (payload.amount !== undefined) {
        updateData.amount = Number(payload.amount);
    }

    const { data, error } = await supabaseAdmin
        .from('transactions')
        .update(updateData)
        .eq('id', id)
        .select(
            'id, user_id, category_id, amount, type, date, description, notes, tags, is_deleted, deleted_at, created_by, updated_by, created_at, updated_at, categories(name, type, color, icon)'
        )
        .single();

    if (error) {
        if (error.code === '23503') {
            const referenceError = new Error('Referenced user or category does not exist');
            referenceError.statusCode = StatusCodes.BAD_REQUEST;
            throw referenceError;
        }
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    return data;
}

async function softDeleteTransaction(id, currentUser) {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
        .from('transactions')
        .update({
            is_deleted: true,
            deleted_at: new Date().toISOString(),
            updated_by: currentUser.id,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

    if (error) {
        if (error.code === '23503') {
            const referenceError = new Error('Referenced user or category does not exist');
            referenceError.statusCode = StatusCodes.BAD_REQUEST;
            throw referenceError;
        }
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    return data;
}

async function hardDeleteTransaction(id) {
    const supabaseAdmin = getSupabaseAdmin();
    const existing = await getTransactionById(id, true);

    const { error } = await supabaseAdmin.from('transactions').delete().eq('id', id);

    if (error) {
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    return existing;
}

async function restoreTransaction(id, currentUser) {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
        .from('transactions')
        .update({
            is_deleted: false,
            deleted_at: null,
            updated_by: currentUser.id,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

    if (error) {
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    return data;
}

async function getTransactionsForRange(startDate, endDate) {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
        .from('transactions')
        .select('id, amount, type, date, category_id, description, created_at')
        .eq('is_deleted', false)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

    if (error) {
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    return data;
}

module.exports = {
    listTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    softDeleteTransaction,
    hardDeleteTransaction,
    restoreTransaction,
    getTransactionsForRange,
};
