const { Ride, Prediction, User } = require('../models');
const { createNotification } = require('./notificationService');

const OLLAMA_URL     = process.env.OLLAMA_URL || 'http://localhost:11434';
const PRIMARY_MODEL  = process.env.OLLAMA_MODEL || 'llama3';
const FALLBACK_MODEL = process.env.OLLAMA_FALLBACK_MODEL || 'mistral';
const REFRESH_MS     = 24 * 60 * 60 * 1000;

const SYSTEM_PROMPT = `Tu es un analyste de la demande pour AtlasWay, une plateforme marocaine de covoiturage.
On te donne un résumé des trajets passés (axes les plus demandés) et le contexte marocain actuel (fêtes, vacances scolaires, weekends, matchs de la Botola, Ramadan, Aïd El Fitr, Aïd El Adha).
Ta tâche : prédire les 8 prochains axes où la demande de covoiturage sera la plus forte dans les 14 prochains jours.

Réponds UNIQUEMENT avec un tableau JSON strict, sans texte autour, de la forme :
[{"villeDepart":"...","villeArrivee":"...","datePrevue":"AAAA-MM-JJ","niveau":"fort|moyen|faible","raison":"..."}]

"raison" doit être une courte phrase en français expliquant pourquoi (ex: "Aïd El Fitr, retours vers les familles", "Weekend + match Botola à Casablanca").`;

async function callOllama(prompt) {
  const callModel = async (model) => {
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }],
        stream: false,
      }),
    });
    if (!res.ok) throw new Error(`Ollama (${model}) a répondu ${res.status}`);
    const data = await res.json();
    return data.message?.content || '';
  };

  try {
    return await callModel(PRIMARY_MODEL);
  } catch {
    return await callModel(FALLBACK_MODEL);
  }
}

function parsePredictions(text) {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('Réponse IA invalide (pas de tableau JSON détecté).');
  const parsed = JSON.parse(match[0]);
  if (!Array.isArray(parsed)) throw new Error('Réponse IA invalide (tableau attendu).');

  return parsed
    .filter((p) => p && p.villeDepart && p.villeArrivee && p.datePrevue && ['fort', 'moyen', 'faible'].includes(p.niveau))
    .map((p) => ({
      villeDepart: String(p.villeDepart).trim(),
      villeArrivee: String(p.villeArrivee).trim(),
      datePrevue: String(p.datePrevue).trim(),
      niveau: p.niveau,
      raison: typeof p.raison === 'string' ? p.raison.trim() : '',
    }));
}

async function buildTrendsSummary() {
  const rows = await Ride.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } } },
    { $group: { _id: { from: '$from', to: '$to' }, total: { $sum: 1 } } },
    { $sort: { total: -1 } },
    { $limit: 15 },
    { $project: { _id: 0, villeDepart: '$_id.from', villeArrivee: '$_id.to', total: 1 } },
  ]);

  if (!rows.length) return 'Aucune donnée de trajets disponible encore — base-toi uniquement sur les axes touristiques/économiques marocains les plus populaires et le calendrier (fêtes, weekends).';

  return rows.map((r) => `${r.villeDepart} → ${r.villeArrivee} (${r.total} trajets sur 90 jours)`).join('\n');
}

async function notifyForPrediction(p) {
  const title = `📈 Forte demande prévue ${p.villeDepart} → ${p.villeArrivee}`;

  const drivers = await User.find({ isDriver: true, driverVerified: true }).select('_id');
  await Promise.all(drivers.map((d) => createNotification(d.id, {
    type: 'system',
    title,
    message: `${p.raison || 'Forte demande attendue.'} Publiez un trajet ${p.villeDepart} → ${p.villeArrivee} pour le ${p.datePrevue}.`,
    link: `/rides/publish?from=${encodeURIComponent(p.villeDepart)}&to=${encodeURIComponent(p.villeArrivee)}`,
  })));

  const passengers = await User.find({ isDriver: false }).select('_id');
  await Promise.all(passengers.map((u) => createNotification(u.id, {
    type: 'system',
    title,
    message: `${p.raison || 'Les places risquent de partir vite.'} Réservez tôt pour ${p.villeDepart} → ${p.villeArrivee} le ${p.datePrevue}.`,
    link: `/rides/search?from=${encodeURIComponent(p.villeDepart)}&to=${encodeURIComponent(p.villeArrivee)}`,
  })));
}

async function generatePredictions() {
  const summary = await buildTrendsSummary();
  const today = new Date().toISOString().slice(0, 10);
  const prompt = `Date d'aujourd'hui : ${today}.\n\nAxes les plus fréquentés ces 90 derniers jours :\n${summary}\n\nDonne tes 8 prédictions.`;

  const raw = await callOllama(prompt);
  const predictions = parsePredictions(raw);

  if (!predictions.length) throw new Error("L'IA n'a renvoyé aucune prédiction exploitable.");

  await Prediction.deleteMany({ createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
  const created = await Prediction.insertMany(predictions);

  const strong = created.filter((p) => p.niveau === 'fort').slice(0, 3);
  for (const p of strong) {
    notifyForPrediction(p).catch((err) => console.error('[Predictions] notification error:', err.message));
  }

  return created;
}

async function getPredictions() {
  const latest = await Prediction.findOne().sort({ createdAt: -1 });
  const isStale = !latest || (Date.now() - new Date(latest.createdAt).getTime()) > REFRESH_MS;

  if (isStale) {
    try {
      await generatePredictions();
    } catch (err) {
      if (!latest) throw err;
      console.warn('[Predictions] régénération échouée, on garde le cache existant:', err.message);
    }
  }

  const all = await Prediction.find().sort({ datePrevue: 1 }).limit(50);
  const rank = { fort: 0, moyen: 1, faible: 2 };
  return all.sort((a, b) => rank[a.niveau] - rank[b.niveau]).slice(0, 20);
}

module.exports = { generatePredictions, getPredictions, REFRESH_MS };
