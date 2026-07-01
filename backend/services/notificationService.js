const Notification = require('../models/Notification');
const { sendPushToUser } = require('./pushService');

async function createNotification(userId, { type = 'system', title, message, link } = {}) {
  try {
    await Notification.create({ userId, type, title, message: message || '', link: link || null });
    // Notification push (best-effort, n'échoue jamais l'appelant)
    sendPushToUser(userId, { title, body: message || '', url: link || '/' });
  } catch (err) {
    console.error('createNotification error:', err.message);
  }
}

module.exports = { createNotification };
