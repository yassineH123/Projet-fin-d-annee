const { getPredictions } = require('../services/predictionService');

async function list(req, res) {
  try {
    const predictions = await getPredictions();
    return res.json({ predictions });
  } catch (err) {
    return res.status(503).json({ message: err.message || "Les prédictions sont momentanément indisponibles." });
  }
}

module.exports = { list };
