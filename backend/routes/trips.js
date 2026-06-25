module.exports = function() {
  const express = require('express');
  const router = express.Router();
  const Trip = require('../models/Trip');

  // GET /trips
  router.get('/', async (req, res) => {
    try {
      const trips = await Trip.find().lean();
      return res.json(trips);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  // POST /trips
  router.post('/', async (req, res) => {
    try {
      const { from, to, date, price, driver, seats } = req.body;
      const newTrip = await Trip.create({ from, to, date, price, driver, seats });
      return res.json(newTrip);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  return router;
};
