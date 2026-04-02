const bcrypt = require('bcryptjs');

const { getSupabaseAdmin } = require('../config/supabase');

const DEFAULT_USERS = [
  { name: 'Admin User', email: 'admin@finance.dev', password: 'Admin@1234', role: 'admin', status: 'active' },
  { name: 'Analyst User', email: 'analyst@finance.dev', password: 'Analyst@1234', role: 'analyst', status: 'active' },
  { name: 'Viewer User', email: 'viewer@finance.dev', password: 'Viewer@1234', role: 'viewer', status: 'active' },
];

async function seedUsers() {
  const supabaseAdmin = getSupabaseAdmin();

  const seededUsers = [];

  for (const user of DEFAULT_USERS) {
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role, status')
      .eq('email', user.email)
      .maybeSingle();

    if (existing) {
      seededUsers.push(existing);
      continue;
    }

    const passwordHash = await bcrypt.hash(user.password, 12);

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        name: user.name,
        email: user.email,
        password_hash: passwordHash,
        role: user.role,
        status: user.status,
      })
      .select('id, name, email, role, status')
      .single();

    if (error) {
      throw error;
    }

    seededUsers.push(data);
  }

  return seededUsers;
}

module.exports = {
  seedUsers,
};
