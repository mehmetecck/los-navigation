const express = require('express');
const fetch = require('node-fetch');

module.exports = (pool, BVG_API) => {
  const router = express.Router();

  // Search for stops/stations
  router.get('/search', async (req, res) => {
    try {
      const { query } = req.query;
      if (!query || query.length < 2) {
        return res.json([]);
      }

      const response = await fetch(
        `${BVG_API}/locations?query=${encodeURIComponent(query)}&results=10&stops=true&addresses=false&poi=false`
      );
      const data = await response.json();
      
      const stops = data
        .filter(loc => loc.type === 'stop' || loc.type === 'station')
        .map(stop => ({
          id: stop.id,
          name: stop.name,
          type: stop.type,
          location: stop.location,
          products: stop.products
        }));

      res.json(stops);
    } catch (error) {
      console.error('Stop search error:', error);
      res.status(500).json({ error: 'Failed to search stops' });
    }
  });

  // Get stop details
  router.get('/:stopId', async (req, res) => {
    try {
      const { stopId } = req.params;
      const response = await fetch(`${BVG_API}/stops/${stopId}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Stop details error:', error);
      res.status(500).json({ error: 'Failed to get stop details' });
    }
  });

  // Get departures from a stop
  router.get('/:stopId/departures', async (req, res) => {
    try {
      const { stopId } = req.params;
      const { duration, results } = req.query;
      
      const params = new URLSearchParams({
        duration: duration || 60,
        results: results || 20
      });

      const response = await fetch(`${BVG_API}/stops/${stopId}/departures?${params}`);
      const data = await response.json();
      res.json(data.departures || data);
    } catch (error) {
      console.error('Departures error:', error);
      res.status(500).json({ error: 'Failed to get departures' });
    }
  });
  
  return router;
};


