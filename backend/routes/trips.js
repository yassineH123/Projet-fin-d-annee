module.exports = function(readStore, writeStore) {
  const express = require('express');
  const router = express.Router();
  const { v4: uuidv4 } = require('uuid');

  // GET /trips
  router.get('/', (req, res) => {
    const store = readStore();
    return res.json(store.trips || []);
  });

  // POST /trips
  router.post('/', (req, res) => {
    const { from, to, date, price, driver, seats } = req.body;
    const store = readStore();
    const newTrip = { id: uuidv4(), from, to, date, price, driver, seats };
    store.trips = store.trips || [];
    store.trips.push(newTrip);
    writeStore(store);
    return res.json(newTrip);
  });

  return router;
};
