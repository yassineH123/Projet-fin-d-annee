const { chatWithOllama } = require('../services/ollamaService');

const MAX_HISTORY = 20;

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

  try {
    const reply = await chatWithOllama(userMessage, safeHistory);
    const updatedHistory = [
      ...safeHistory,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: reply },
    ];
    return res.json({ reply, history: updatedHistory });
  } catch (err) {
    return res.status(503).json({ message: err.message });
  }
}

module.exports = { sendMessage };
