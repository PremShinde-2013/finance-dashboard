function getMonthBoundaries(baseDate = new Date()) {
    const start = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), 1));
    const end = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth() + 1, 0, 23, 59, 59));
    return { start, end };
}

function getPreviousMonthBoundaries(baseDate = new Date()) {
    const start = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth() - 1, 1));
    const end = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), 0, 23, 59, 59));
    return { start, end };
}

function toISODate(value) {
    return new Date(value).toISOString().slice(0, 10);
}

module.exports = {
    getMonthBoundaries,
    getPreviousMonthBoundaries,
    toISODate,
};
