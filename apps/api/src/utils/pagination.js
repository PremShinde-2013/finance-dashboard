function parsePagination(query) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    return {
        page,
        limit,
        from,
        to,
    };
}

function getPaginationMeta({ page, limit, total = 0 }) {
    return {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
    };
}

module.exports = {
    parsePagination,
    getPaginationMeta,
};
