const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // Get all saved journeys (optionally by user)
  router.get('/journeys', async (req, res) => {
    try {
      const { userId } = req.query;
      
      let query = 'SELECT * FROM saved_journeys';
      let params = [];
      
      if (userId) {
        query += ' WHERE user_id = $1';
        params.push(userId);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Get saved journeys error:', error);
      res.status(500).json({ error: 'Failed to get saved journeys' });
    }
  });

  // Legacy route - redirect to /journeys
  router.get('/', async (req, res) => {
    try {
      const { userId } = req.query;
      
      let query = 'SELECT * FROM saved_journeys';
      let params = [];
      
      if (userId) {
        query += ' WHERE user_id = $1';
        params.push(userId);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Get saved journeys error:', error);
      res.status(500).json({ error: 'Failed to get saved journeys' });
    }
  });

  // Save a journey
  router.post('/journeys', async (req, res) => {
    try {
      const { name, origin_id, origin_name, destination_id, destination_name, stopovers, legs, userId } = req.body;

      const result = await pool.query(
        `INSERT INTO saved_journeys (name, origin_id, origin_name, destination_id, destination_name, stopovers, legs, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [name, origin_id, origin_name, destination_id, destination_name, JSON.stringify(stopovers || []), JSON.stringify(legs || []), userId || null]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Save journey error:', error);
      res.status(500).json({ error: 'Failed to save journey' });
    }
  });

  // Legacy route for saving
  router.post('/', async (req, res) => {
    try {
      const { name, origin_id, origin_name, destination_id, destination_name, stopovers, legs, userId } = req.body;

      const result = await pool.query(
        `INSERT INTO saved_journeys (name, origin_id, origin_name, destination_id, destination_name, stopovers, legs, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [name, origin_id, origin_name, destination_id, destination_name, JSON.stringify(stopovers || []), JSON.stringify(legs || []), userId || null]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Save journey error:', error);
      res.status(500).json({ error: 'Failed to save journey' });
    }
  });

  // Delete a saved journey
  router.delete('/journeys/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM saved_journeys WHERE id = $1', [id]);
      res.json({ message: 'Journey deleted' });
    } catch (error) {
      console.error('Delete journey error:', error);
      res.status(500).json({ error: 'Failed to delete journey' });
    }
  });

  // Legacy delete route
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM saved_journeys WHERE id = $1', [id]);
      res.json({ message: 'Journey deleted' });
    } catch (error) {
      console.error('Delete journey error:', error);
      res.status(500).json({ error: 'Failed to delete journey' });
    }
  });

  // ============ SAVED STOPS ============

  // Get all saved stops (optionally by user)
  router.get('/stops', async (req, res) => {
    try {
      const { userId } = req.query;
      
      let query = 'SELECT * FROM saved_stops';
      let params = [];
      
      if (userId) {
        query += ' WHERE user_id = $1';
        params.push(userId);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Get saved stops error:', error);
      res.status(500).json({ error: 'Failed to get saved stops' });
    }
  });

  // Save a stop
  router.post('/stops', async (req, res) => {
    try {
      const { stop_id, stop_name, custom_name, userId } = req.body;

      if (!stop_id || !stop_name) {
        return res.status(400).json({ error: 'Stop ID and name are required' });
      }

      // Check if stop already saved by this user
      const existing = await pool.query(
        'SELECT id FROM saved_stops WHERE stop_id = $1 AND (user_id = $2 OR ($2 IS NULL AND user_id IS NULL))',
        [stop_id, userId || null]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Stop already saved' });
      }

      const result = await pool.query(
        `INSERT INTO saved_stops (stop_id, stop_name, custom_name, user_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [stop_id, stop_name, custom_name || null, userId || null]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Save stop error:', error);
      res.status(500).json({ error: 'Failed to save stop' });
    }
  });

  // Update a saved stop (for custom name)
  router.put('/stops/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { custom_name } = req.body;

      const result = await pool.query(
        `UPDATE saved_stops SET custom_name = $1 WHERE id = $2 RETURNING *`,
        [custom_name || null, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Stop not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update stop error:', error);
      res.status(500).json({ error: 'Failed to update stop' });
    }
  });

  // Delete a saved stop
  router.delete('/stops/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM saved_stops WHERE id = $1', [id]);
      res.json({ message: 'Stop deleted' });
    } catch (error) {
      console.error('Delete stop error:', error);
      res.status(500).json({ error: 'Failed to delete stop' });
    }
  });

  return router;
};
