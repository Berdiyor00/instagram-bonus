const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase env vars not configured. Falling back to file storage.');
}

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

async function getUsersFromStore() {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

async function addUserToStore(user) {
  if (!supabase) {
    return []; 
  }

  const { data, error } = await supabase
    .from('users')
    .insert([{
      username: user.username,
      email: user.email,
      password: user.password,
      full_name: user.fullName,
      mode: user.mode,
      bonus: user.bonus,
      created_at: new Date().toISOString(),
    }])
    .select();

  if (error) {
    throw error;
  }

  return data || [];
}

async function clearUsersFromStore() {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.from('users').delete().neq('id', 0).select();
  if (error) {
    throw error;
  }
  return data || [];
}

module.exports = {
  getUsersFromStore,
  addUserToStore,
  clearUsersFromStore,
};
