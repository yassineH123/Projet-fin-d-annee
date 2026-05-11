module.exports = function(readStore, writeStore) {
  const express = require('express');
  const router = express.Router();
  const { v4: uuidv4 } = require('uuid');

  // POST /auth/login
  router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const store = readStore();
    const user = store.users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    // Return mock token
    return res.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }, token: 'mock-token-' + user.id });
  });

  // POST /auth/register
  router.post('/register', (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    const store = readStore();
    if (store.users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already exists' });
    const newUser = { id: uuidv4(), email, password, firstName, lastName };
    store.users.push(newUser);
    writeStore(store);
    return res.json({ user: { id: newUser.id, email, firstName, lastName }, token: 'mock-token-' + newUser.id });
  });

  // POST /auth/change-password
  router.post('/change-password', (req, res) => {
    const { email, currentPassword, newPassword } = req.body;
    const store = readStore();
    const user = store.users.find(u => u.email === email && u.password === currentPassword);
    if (!user) return res.status(400).json({ error: 'Current password incorrect' });
    user.password = newPassword;
    writeStore(store);
    return res.json({ ok: true });
  });

  return router;
};
