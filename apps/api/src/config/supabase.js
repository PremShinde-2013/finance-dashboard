const { createClient } = require('@supabase/supabase-js');

let supabaseClient;
let supabaseAdminClient;

function ensureSupabaseEnv() {
    if (!process.env.SUPABASE_URL) {
        throw new Error('Missing SUPABASE_URL in environment variables');
    }

    if (!process.env.SUPABASE_ANON_KEY) {
        throw new Error('Missing SUPABASE_ANON_KEY in environment variables');
    }
}

function getSupabase() {
    ensureSupabaseEnv();

    if (!supabaseClient) {
        supabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
            auth: { persistSession: false },
        });
    }

    return supabaseClient;
}

function getSupabaseAdmin() {
    ensureSupabaseEnv();

    if (!supabaseAdminClient) {
        supabaseAdminClient = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
            {
                auth: { persistSession: false },
            }
        );
    }

    return supabaseAdminClient;
}

module.exports = {
    getSupabase,
    getSupabaseAdmin,
};
