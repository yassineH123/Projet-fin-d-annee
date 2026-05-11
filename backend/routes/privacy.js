module.exports = function(readStore, writeStore) {
  const express = require('express');
  const router = express.Router();
  const fs = require('fs');
  const path = require('path');

  // GET /privacy/export - returns a JSON export (mock)
  router.get('/export', (req, res) => {
    const store = readStore();
    const payload = { users: store.users || [], trips: store.trips || [] };
    res.setHeader('Content-Disposition', 'attachment; filename="export.json"');
    res.setHeader('Content-Type', 'application/json');
    return res.send(JSON.stringify(payload, null, 2));
  });

  // POST /privacy/delete - delete a user's data by email (mock)
  router.post('/delete', (req, res) => {
    const { email } = req.body;
    const store = readStore();
    store.users = (store.users || []).filter(u => u.email !== email);
    store.trips = (store.trips || []).filter(t => t.ownerEmail !== email);
    writeStore(store);
    return res.json({ ok: true });
  });

  return router;
};
