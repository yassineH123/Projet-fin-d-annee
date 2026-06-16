const express = require('express');
const { Notification } = require('../models');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authenticateToken);

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