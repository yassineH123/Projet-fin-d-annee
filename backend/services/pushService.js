const webpush = require('web-push');
const { PushSubscription } = require('../models');

const PUBLIC  = process.env.VAPID_PUBLIC;
const PRIVATE = process.env.VAPID_PRIVATE;
const SUBJECT = process.env.VAPID_SUBJECT || 'mailto:contact@atlasway.ma';

let enabled = false;
if (PUBLIC && PRIVATE) {
  try {
    webpush.setVapidDetails(SUBJECT, PUBLIC, PRIVATE);
    enabled = true;
  } catch (e) {
    console.warn('Web Push désactivé (clés VAPID invalides) :', e.message);
  }
} else {
  console.warn('Web Push désactivé (VAPID_PUBLIC / VAPID_PRIVATE manquants dans .env)');
}

/**
 * Envoie une notification push à tous les appareils d'un utilisateur.
 * payload : { title, body, url }
 */
async function sendPushToUser(userId, payload) {
  if (!enabled) return;
  try {
    const subs = await PushSubscription.find({ userId });
    await Promise.all(subs.map(async (s) => {
      const subscription = { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } };
      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
      } catch (err) {
        // 404 / 410 = abonnement expiré → on le supprime
        if (err.statusCode === 404 || err.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: s._id }).catch(() => {});
        }
      }
    }));
  } catch (err) {
    console.warn('Erreur envoi push :', err.message);
  }
}

module.exports = { sendPushToUser, vapidPublicKey: PUBLIC, enabled };
