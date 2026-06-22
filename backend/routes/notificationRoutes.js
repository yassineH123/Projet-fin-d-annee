const express = require('express');
const { Notification, PushSubscription } = require('../models');
const { authenticateToken } = require('../middleware/authMiddleware');
const { vapidPublicKey } = require('../services/pushService');

const router = express.Router();
router.use(authenticateToken);

// Clé publique VAPID (pour s'abonner côté navigateur)
router.get('/vapid-public-key', (req, res) => {
  return res.json({ key: vapidPublicKey || null });
});

// Enregistre l'abonnement push du navigateur courant
router.post('/subscribe', async (req, res, next) => {
  try {
    const { endpoint, keys } = req.body || {};
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ message: 'Abonnement invalide.' });
    }
    const [sub] = await PushSubscription.findOrCreate({
      where: { endpoint },
      defaults: { userId: req.user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
    });
    // Réassigne au cas où l'endpoint change d'utilisateur ou de clés
    await sub.update({ userId: req.user.id, p256dh: keys.p256dh, auth: keys.auth });
    return res.status(201).json({ ok: true });
  } catch (err) { return next(err); }
});

// Désabonnement
router.post('/unsubscribe', async (req, res, next) => {
  try {
    const { endpoint } = req.body || {};
    if (endpoint) await PushSubscription.destroy({ where: { endpoint } });
    return res.json({ ok: true });
  } catch (err) { return next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const notifs = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    return res.json({ notifications: notifs, unreadCount: notifs.filter(n => !n.read).length });
  } catch (err) { return next(err); }
});

router.put('/read-all', async (req, res, next) => {
  try {
    await Notification.update({ read: true }, { where: { userId: req.user.id } });
    return res.json({ ok: true });
  } catch (err) { return next(err); }
});

router.put('/:id/read', async (req, res, next) => {
  try {
    await Notification.update({ read: true }, { where: { id: req.params.id, userId: req.user.id } });
    return res.json({ ok: true });
  } catch (err) { return next(err); }
});

module.exports = router;
