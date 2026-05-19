module.exports = function() {
  const express = require('express');
  const router = express.Router();
  const User = require('../models/User');

  // GET /users/:id
  router.get('/:id', async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, avatar: user.avatar || null });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  return router;
};
