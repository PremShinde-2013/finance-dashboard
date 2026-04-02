const { StatusCodes } = require('http-status-codes');

const { getSupabaseAdmin } = require('../../config/supabase');

async function listCategories() {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
        .from('categories')
        .select('*')
        .order('type', { ascending: true })
        .order('name', { ascending: true });

    if (error) {
        if (error.code === '23505') {
            const conflictError = new Error('Category name already exists for this type');
            conflictError.statusCode = StatusCodes.CONFLICT;
            throw conflictError;
        }
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    return data;
}

async function getCategoryById(id) {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin.from('categories').select('*').eq('id', id).single();

    if (error) {
        error.statusCode = StatusCodes.NOT_FOUND;
        throw error;
    }

    return data;
}

async function createCategory(payload, userId) {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
        .from('categories')
        .insert({
            name: payload.name,
            type: payload.type,
            color: payload.color || null,
            icon: payload.icon || null,
            is_default: payload.is_default || false,
            created_by: userId,
        })
        .select('*')
        .single();

    if (error) {
        if (error.code === '23505') {
            const conflictError = new Error('Category name already exists for this type');
            conflictError.statusCode = StatusCodes.CONFLICT;
            throw conflictError;
        }
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    return data;
}

async function updateCategory(id, payload) {
    const supabaseAdmin = getSupabaseAdmin();

    const updateData = {
        updated_at: new Date().toISOString(),
    };

    ['name', 'type', 'color', 'icon', 'is_default'].forEach((field) => {
        if (payload[field] !== undefined) {
            updateData[field] = payload[field];
        }
    });

    const { data, error } = await supabaseAdmin
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

    if (error) {
        if (error.code === '23505') {
            const conflictError = new Error('Category name already exists for this type');
            conflictError.statusCode = StatusCodes.CONFLICT;
            throw conflictError;
        }
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    return data;
}

async function deleteCategory(id) {
    const supabaseAdmin = getSupabaseAdmin();
    const category = await getCategoryById(id);

    if (category.is_default) {
        const error = new Error('Default category cannot be deleted');
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);

    if (error) {
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    return category;
}

module.exports = {
    listCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
