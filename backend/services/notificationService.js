const Notification = require('../models/Notification');

async function createNotification(userId, { type = 'system', title, message, link } = {}) {
  try {
    await Notification.create({ userId, type, title, message: message || '', link: link || null });
  } catch (err) {
    console.error('createNotification error:', err.message);
  }
}

module.exports = { createNotification };
