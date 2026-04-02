const logger = require('../config/logger');
const { getSupabaseAdmin } = require('../config/supabase');

async function logAudit({
    userId,
    action,
    entity,
    entityId,
    oldData,
    newData,
    ipAddress,
    userAgent,
}) {
    try {
        const supabaseAdmin = getSupabaseAdmin();

        await supabaseAdmin.from('audit_logs').insert({
            user_id: userId || null,
            action,
            entity: entity || null,
            entity_id: entityId || null,
            old_data: oldData || null,
            new_data: newData || null,
            ip_address: ipAddress || null,
            user_agent: userAgent || null,
        });
    } catch (error) {
        logger.error(`Failed to insert audit log: ${error.message}`);
    }
}

function extractRequestMeta(req) {
    return {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
    };
}

module.exports = {
    logAudit,
    extractRequestMeta,
};
