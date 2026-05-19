module.exports = function() {
  const express = require('express');
  const router = express.Router();
  const User = require('../models/User');

  // POST /auth/login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email, password } });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      return res.json({ 
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }, 
        token: 'mock-token-' + user.id 
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  // POST /auth/register
  router.post('/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(400).json({ error: 'Email already exists' });
      const newUser = await User.create({ email, password, firstName, lastName });
      return res.json({ 
        user: { id: newUser.id, email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName }, 
        token: 'mock-token-' + newUser.id 
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  // POST /auth/change-password
  router.post('/change-password', async (req, res) => {
    try {
      const { email, currentPassword, newPassword } = req.body;
      const user = await User.findOne({ where: { email, password: currentPassword } });
      if (!user) return res.status(400).json({ error: 'Current password incorrect' });
      await user.update({ password: newPassword });
      return res.json({ ok: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  return router;
};
