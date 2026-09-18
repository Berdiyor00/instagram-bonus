const { getUsersFromStore, addUserToStore, clearUsersFromStore } = require('../supabase');

module.exports = async function handler(req, res) {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (req.method === 'GET') {
    if (req.headers['x-admin-password'] !== adminPassword) {
      return res.status(401).json({ error: 'Admin access required.' });
    }

    try {
      const users = await getUsersFromStore();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Failed to fetch users.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const user = {
        username: body.username,
        email: body.email,
        password: body.password,
        fullName: body.fullName,
        mode: body.mode,
        bonus: body.bonus,
      };

      const inserted = await addUserToStore(user);
      return res.status(200).json(inserted);
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Failed to save user.' });
    }
  }

  if (req.method === 'DELETE') {
    if (req.headers['x-admin-password'] !== adminPassword) {
      return res.status(401).json({ error: 'Admin access required.' });
    }

    try {
      const users = await clearUsersFromStore();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Failed to clear users.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed.' });
};
