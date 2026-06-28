module.exports = function() {
  const express = require('express');
  const router = express.Router();
  const User = require('../models/User');
  const Trip = require('../models/Trip');
  const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

  // GET /privacy/export - export complet réservé au superadmin, sans champs sensibles
  router.get('/export', authenticateToken, authorizeRoles('superadmin'), async (req, res) => {
    try {
      const users = await User.find().select('-password -cinDoc -permisDoc -carteGriseDoc -passportDoc -kycSelfie').lean();
      const trips = await Trip.find().lean();
      const payload = { users, trips };
      res.setHeader('Content-Disposition', 'attachment; filename="export.json"');
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify(payload, null, 2));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  // POST /privacy/delete - un utilisateur ne peut supprimer que son propre compte
  router.post('/delete', authenticateToken, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });
      await user.deleteOne();
      return res.json({ ok: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  return router;
};
