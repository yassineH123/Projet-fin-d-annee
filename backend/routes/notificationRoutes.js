const express = require('express');
const { Notification, PushSubscription } = require('../models');
const { authenticateToken } = require('../middleware/authMiddleware');
const { vapidPublicKey } = require('../services/pushService');

const router = express.Router();
router.use(authenticateToken);

router.get('/vapid-public-key', (req, res) => {
  return res.json({ key: vapidPublicKey || null });
});

router.post('/subscribe', async (req, res, next) => {
  try {
    const { endpoint, keys } = req.body || {};
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ message: 'Abonnement invalide.' });
    }
    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { userId: req.user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
      { upsert: true, new: true }
    );
    return res.status(201).json({ ok: true });
  } catch (err) { return next(err); }
});

router.post('/unsubscribe', async (req, res, next) => {
  try {
    const { endpoint } = req.body || {};
    if (endpoint) await PushSubscription.deleteOne({ endpoint });
    return res.json({ ok: true });
  } catch (err) { return next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const notifs = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return res.json({ notifications: notifs, unreadCount: notifs.filter(n => !n.read).length });
  } catch (err) { return next(err); }
});

router.put('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user.id }, { read: true });
    return res.json({ ok: true });
  } catch (err) { return next(err); }
});

router.put('/:id/read', async (req, res, next) => {
  try {
    await Notification.updateOne({ _id: req.params.id, userId: req.user.id }, { read: true });
    return res.json({ ok: true });
  } catch (err) { return next(err); }
});

module.exports = router;
