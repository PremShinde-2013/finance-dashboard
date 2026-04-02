const { StatusCodes } = require('http-status-codes');

const { getSupabaseAdmin } = require('../../config/supabase');
const { getMonthBoundaries, getPreviousMonthBoundaries, toISODate } = require('../../utils/dateHelpers');

function parseDateRange(query) {
    const now = new Date();
    const start = query.start_date ? new Date(query.start_date) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = query.end_date ? new Date(query.end_date) : now;

    return {
        start: toISODate(start),
        end: toISODate(end),
    };
}

function sumByType(rows) {
    const income = rows.filter((item) => item.type === 'income').reduce((sum, item) => sum + Number(item.amount), 0);
    const expense = rows.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0);
    return {
        income,
        expense,
        net: income - expense,
        count: rows.length,
    };
}

async function fetchTransactionsForRange(query) {
    const supabaseAdmin = getSupabaseAdmin();
    const { start, end } = parseDateRange(query);

    const { data, error } = await supabaseAdmin
        .from('transactions')
        .select('id, category_id, amount, type, date, description, created_at')
        .eq('is_deleted', false)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: true });

    if (error) {
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    return data;
}

async function getSummary(query) {
    const rows = await fetchTransactionsForRange(query);
    return sumByType(rows);
}

async function getCategoryBreakdown(query) {
    const rows = await fetchTransactionsForRange(query);
    const supabaseAdmin = getSupabaseAdmin();

    const { data: categories } = await supabaseAdmin.from('categories').select('id, name, type, color');
    const categoryMap = new Map((categories || []).map((item) => [item.id, item]));

    const grouped = rows.reduce((acc, row) => {
        const category = categoryMap.get(row.category_id);
        const key = row.category_id || 'uncategorized';

        if (!acc[key]) {
            acc[key] = {
                category_id: row.category_id,
                name: category?.name || 'Uncategorized',
                type: category?.type || row.type,
                color: category?.color || null,
                total: 0,
            };
        }

        acc[key].total += Number(row.amount);
        return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => b.total - a.total);
}

async function getRecentActivity(query) {
    const supabaseAdmin = getSupabaseAdmin();
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 5));

    const { data, error } = await supabaseAdmin
        .from('transactions')
        .select('id, amount, type, date, description, category_id, created_at, categories(name, color, type)')
        .eq('is_deleted', false)
        .order('date', { ascending: false })
        .limit(limit);

    if (error) {
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    return data;
}

async function getMonthlyTrends() {
    const supabaseAdmin = getSupabaseAdmin();
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));

    const { data, error } = await supabaseAdmin
        .from('transactions')
        .select('amount, type, date')
        .eq('is_deleted', false)
        .gte('date', toISODate(start))
        .lte('date', toISODate(now));

    if (error) {
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    const buckets = new Map();

    for (let i = 0; i < 12; i += 1) {
        const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
        const key = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`;
        buckets.set(key, { month: key, income: 0, expense: 0 });
    }

    (data || []).forEach((row) => {
        const date = new Date(row.date);
        const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
        if (!buckets.has(key)) {
            buckets.set(key, { month: key, income: 0, expense: 0 });
        }
        const bucket = buckets.get(key);
        bucket[row.type] += Number(row.amount);
    });

    return Array.from(buckets.values());
}

async function getWeeklyTrends() {
    const supabaseAdmin = getSupabaseAdmin();
    const { start, end } = getMonthBoundaries(new Date());

    const { data, error } = await supabaseAdmin
        .from('transactions')
        .select('amount, type, date')
        .eq('is_deleted', false)
        .gte('date', toISODate(start))
        .lte('date', toISODate(end));

    if (error) {
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    const buckets = [1, 2, 3, 4, 5].map((week) => ({ week: `Week ${week}`, income: 0, expense: 0 }));

    (data || []).forEach((row) => {
        const day = new Date(row.date).getUTCDate();
        const weekIndex = Math.min(4, Math.floor((day - 1) / 7));
        buckets[weekIndex][row.type] += Number(row.amount);
    });

    return buckets;
}

async function getTopCategories(query) {
    const limit = Math.min(20, Math.max(1, Number(query.limit) || 5));
    const type = query.type === 'income' ? 'income' : 'expense';
    const breakdown = await getCategoryBreakdown(query);

    return breakdown.filter((item) => item.type === type).slice(0, limit);
}

function getPercentChange(current, previous) {
    if (!previous) {
        return current > 0 ? 100 : 0;
    }
    return Number((((current - previous) / previous) * 100).toFixed(2));
}

async function getComparison() {
    const supabaseAdmin = getSupabaseAdmin();
    const currentRange = getMonthBoundaries(new Date());
    const previousRange = getPreviousMonthBoundaries(new Date());

    const [currentResult, previousResult] = await Promise.all([
        supabaseAdmin
            .from('transactions')
            .select('amount, type')
            .eq('is_deleted', false)
            .gte('date', toISODate(currentRange.start))
            .lte('date', toISODate(currentRange.end)),
        supabaseAdmin
            .from('transactions')
            .select('amount, type')
            .eq('is_deleted', false)
            .gte('date', toISODate(previousRange.start))
            .lte('date', toISODate(previousRange.end)),
    ]);

    if (currentResult.error || previousResult.error) {
        const error = currentResult.error || previousResult.error;
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    const current = sumByType(currentResult.data || []);
    const previous = sumByType(previousResult.data || []);

    return {
        current,
        previous,
        change: {
            incomePercent: getPercentChange(current.income, previous.income),
            expensePercent: getPercentChange(current.expense, previous.expense),
            netPercent: getPercentChange(current.net, previous.net),
        },
    };
}

module.exports = {
    getSummary,
    getCategoryBreakdown,
    getRecentActivity,
    getMonthlyTrends,
    getWeeklyTrends,
    getTopCategories,
    getComparison,
};
