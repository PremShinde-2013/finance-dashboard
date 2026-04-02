const { getSupabaseAdmin } = require('../config/supabase');

const CATEGORY_SEED = [
  { name: 'Salary', type: 'income', color: '#22C55E', icon: 'Wallet', is_default: true },
  { name: 'Freelance', type: 'income', color: '#10B981', icon: 'Briefcase', is_default: true },
  { name: 'Investment', type: 'income', color: '#059669', icon: 'TrendingUp', is_default: true },
  { name: 'Business', type: 'income', color: '#0EA5E9', icon: 'Building2', is_default: true },
  { name: 'Other Income', type: 'income', color: '#6366F1', icon: 'PiggyBank', is_default: true },
  { name: 'Food', type: 'expense', color: '#EF4444', icon: 'Utensils', is_default: true },
  { name: 'Rent', type: 'expense', color: '#DC2626', icon: 'Home', is_default: true },
  { name: 'Transport', type: 'expense', color: '#F97316', icon: 'Bus', is_default: true },
  { name: 'Health', type: 'expense', color: '#EC4899', icon: 'HeartPulse', is_default: true },
  { name: 'Shopping', type: 'expense', color: '#A855F7', icon: 'ShoppingCart', is_default: true },
  { name: 'Entertainment', type: 'expense', color: '#8B5CF6', icon: 'Film', is_default: true },
  { name: 'Utilities', type: 'expense', color: '#F59E0B', icon: 'Lightbulb', is_default: true },
  { name: 'Education', type: 'expense', color: '#3B82F6', icon: 'GraduationCap', is_default: true },
  { name: 'Other Expense', type: 'expense', color: '#6B7280', icon: 'CircleEllipsis', is_default: true },
];

async function seedCategories(createdByUserId) {
  const supabaseAdmin = getSupabaseAdmin();

  const seeded = [];

  for (const category of CATEGORY_SEED) {
    const { data: existing } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('name', category.name)
      .eq('type', category.type)
      .maybeSingle();

    if (existing) {
      seeded.push(existing);
      continue;
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({
        ...category,
        created_by: createdByUserId || null,
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    seeded.push(data);
  }

  return seeded;
}

module.exports = {
  seedCategories,
  CATEGORY_SEED,
};
