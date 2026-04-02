const { getSupabaseAdmin } = require('../config/supabase');

const TXN_COUNT = 100;

const INCOME_RANGE = { min: 15000, max: 180000 };
const EXPENSE_RANGE = { min: 200, max: 25000 };

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomAmount(type) {
  const range = type === 'income' ? INCOME_RANGE : EXPENSE_RANGE;
  return Number((randomNumber(range.min, range.max) + Math.random()).toFixed(2));
}

function randomDateInLastMonths(months = 6) {
  const now = new Date();
  const past = new Date();
  past.setMonth(now.getMonth() - months);

  const timestamp = randomNumber(past.getTime(), now.getTime());
  return new Date(timestamp).toISOString().slice(0, 10);
}

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function buildTransactionPayload(users, categories) {
  const user = pickRandom(users);
  const type = Math.random() < 0.35 ? 'income' : 'expense';
  const eligibleCategories = categories.filter((category) => category.type === type);
  const category = pickRandom(eligibleCategories);

  const tags =
    type === 'income'
      ? ['salary', 'monthly', 'credit', 'invoice', 'project']
      : ['upi', 'card', 'cash', 'essential', 'lifestyle'];

  return {
    user_id: user.id,
    category_id: category ? category.id : null,
    amount: randomAmount(type),
    type,
    date: randomDateInLastMonths(6),
    description:
      type === 'income'
        ? `Income via ${category ? category.name : 'source'}`
        : `Expense on ${category ? category.name : 'category'}`,
    notes: type === 'income' ? 'Seeded income entry' : 'Seeded expense entry',
    tags: [pickRandom(tags), pickRandom(tags)].filter((value, index, self) => self.indexOf(value) === index),
    is_deleted: false,
    created_by: user.id,
    updated_by: user.id,
  };
}

async function seedTransactions(users, categories) {
  const supabaseAdmin = getSupabaseAdmin();

  const { count } = await supabaseAdmin.from('transactions').select('id', { count: 'exact', head: true });

  if ((count || 0) >= TXN_COUNT) {
    return { inserted: 0, total: count || 0 };
  }

  const toInsert = TXN_COUNT - (count || 0);
  const rows = Array.from({ length: toInsert }, () => buildTransactionPayload(users, categories));

  const { error } = await supabaseAdmin.from('transactions').insert(rows);

  if (error) {
    throw error;
  }

  return {
    inserted: toInsert,
    total: TXN_COUNT,
  };
}

module.exports = {
  seedTransactions,
};
