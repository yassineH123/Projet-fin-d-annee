/* Envoie un push de test à un utilisateur (par email).
   Usage : node sendTestPush.js [email]  (défaut: admin@atlasway.com) */
require('dotenv').config();
const sequelize = require('./database');
const { User, PushSubscription } = require('./models');
const { sendPushToUser, enabled } = require('./services/pushService');

(async () => {
  try {
    await sequelize.authenticate();
    const email = process.argv[2] || 'admin@atlasway.com';
    const user = await User.findOne({ where: { email } });
    if (!user) { console.log('Utilisateur introuvable:', email); process.exit(1); }

    const subs = await PushSubscription.count({ where: { userId: user.id } });
    console.log(`Web Push activé: ${enabled} | abonnements pour ${email}: ${subs}`);
    if (subs === 0) {
      console.log('⚠️  Aucun abonnement. Active d\'abord les notifications dans le navigateur (cloche 🔔).');
      process.exit(0);
    }

    await sendPushToUser(user.id, {
      title: '🎉 AtlasWay — Test push',
      body: 'Bravo, les notifications push fonctionnent !',
      url: '/',
    });
    console.log('✅ Push envoyé à', email);
    process.exit(0);
  } catch (e) {
    console.error('Erreur:', e.message);
    process.exit(1);
  }
})();
