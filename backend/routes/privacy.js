module.exports = function() {
  const express = require('express');
  const router = express.Router();
  const User = require('../models/User');
  const Trip = require('../models/Trip');

  // GET /privacy/export - returns a JSON export (mock)
  router.get('/export', async (req, res) => {
    try {
      const users = await User.find().lean();
      const trips = await Trip.find().lean();
      const payload = { users, trips };
      res.setHeader('Content-Disposition', 'attachment; filename="export.json"');
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify(payload, null, 2));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  // POST /privacy/delete - delete a user's data by email (mock)
  router.post('/delete', async (req, res) => {
    try {
      const { email } = req.body;
      await User.deleteOne({ email });
      return res.json({ ok: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  return router;
};
