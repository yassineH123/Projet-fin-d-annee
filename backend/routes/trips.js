module.exports = function() {
  const express = require('express');
  const router = express.Router();
  const Trip = require('../models/Trip');
  const { authenticateToken } = require('../middleware/authMiddleware');

  // GET /trips
  router.get('/', async (req, res) => {
    try {
      const trips = await Trip.find().lean();
      return res.json(trips);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  // POST /trips - le conducteur est déduit du compte authentifié, jamais du body (anti-usurpation)
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const { from, to, date, price, seats } = req.body;
      if (!from || !to || !date) {
        return res.status(400).json({ error: 'from, to et date sont requis.' });
      }
      const newTrip = await Trip.create({ from, to, date, price, driver: req.user.id, seats });
      return res.json(newTrip);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  return router;
};
