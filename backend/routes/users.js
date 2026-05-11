module.exports = function(readStore) {
  const express = require('express');
  const router = express.Router();

  // GET /users/:id
  router.get('/:id', (req, res) => {
    const store = readStore();
    const user = store.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, avatar: user.avatar || null });
  });

  return router;
};
