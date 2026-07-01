const { chatWithOllama, detectIntent } = require('../services/ollamaService');
const { Ride } = require('../models');

const MAX_HISTORY = 16;

const QUICK_REPLIES = {
  price: ['Prix Casablanca-Rabat ?', 'Prix Casablanca-Marrakech ?', 'Comment payer ?'],
  booking: ['Comment réserver ?', 'Annuler une réservation ?', 'Remboursement ?'],
  driver: ['Comment publier un trajet ?', 'Combien je gagne ?', 'Vérification conducteur ?'],
  safety: ['Comment vérifier un conducteur ?', 'Que faire en cas de problème ?'],
  emergency: ['Numéro police Maroc', 'Contacter AtlasWay'],
  general: ['Rechercher un trajet', 'Devenir conducteur', 'Prix des trajets', 'Sécurité sur AtlasWay'],
};

async function sendMessage(req, res) {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ message: 'Le message est requis.' });
  }

  const safeHistory = Array.isArray(history)
    ? history
        .filter((h) => h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string')
        .slice(-MAX_HISTORY)
        .map((h) => ({ role: h.role, content: h.content }))
    : [];

  const userMessage = message.trim().slice(0, 2000);
  const { intent } = detectIntent(userMessage);

  // Fetch real-time context from DB
  let context = {};
  try {
    const ridesCount = await Ride.countDocuments({ status: 'active', departureDate: { $gte: new Date() } });
    context.ridesCount = ridesCount;
  } catch (_) {}

  try {
    const reply = await chatWithOllama(userMessage, safeHistory, context);
    const updatedHistory = [
      ...safeHistory,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: reply },
    ];

    return res.json({
      reply,
      history: updatedHistory,
      quickReplies: QUICK_REPLIES[intent] || QUICK_REPLIES.general,
      intent,
    });
  } catch (err) {
    return res.status(503).json({ message: err.message });
  }
}

module.exports = { sendMessage };
