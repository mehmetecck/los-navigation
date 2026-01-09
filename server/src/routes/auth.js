const express = require('express');
const crypto = require('crypto');

module.exports = (pool) => {
  const router = express.Router();

  // Simple password hashing (in production, use bcrypt)
  const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
  };

  // Register
  router.post('/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Check if email already exists
      const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      const hashedPassword = hashPassword(password);

      const result = await pool.query(
        `INSERT INTO users (username, email, password)
         VALUES ($1, $2, $3)
         RETURNING id, username, email, created_at`,
        [username, email.toLowerCase(), hashedPassword]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const hashedPassword = hashPassword(password);

      const result = await pool.query(
        'SELECT id, username, email, created_at FROM users WHERE email = $1 AND password = $2',
        [email.toLowerCase(), hashedPassword]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Get user profile
  router.get('/profile/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      const result = await pool.query(
        'SELECT id, username, email, created_at FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  });

  // Delete all user data (journeys and stops)
  router.delete('/data/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      await pool.query('DELETE FROM saved_journeys WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM saved_stops WHERE user_id = $1', [userId]);

      res.json({ message: 'All data deleted' });
    } catch (error) {
      console.error('Delete data error:', error);
      res.status(500).json({ error: 'Failed to delete data' });
    }
  });

  // Delete account
  router.delete('/account/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      // Delete all user data first
      await pool.query('DELETE FROM saved_journeys WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM saved_stops WHERE user_id = $1', [userId]);
      
      // Delete the user
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);

      res.json({ message: 'Account deleted' });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ error: 'Failed to delete account' });
    }
  });

  return router;
};

