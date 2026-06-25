const OLLAMA_URL       = process.env.OLLAMA_URL || 'http://localhost:11434';
const PRIMARY_MODEL    = process.env.OLLAMA_MODEL || 'llama3';
const FALLBACK_MODEL   = process.env.OLLAMA_FALLBACK_MODEL || 'mistral';
const UNAVAILABLE_MSG  = "AtlasBot est momentanément indisponible. Vérifiez qu'Ollama est lancé (`ollama serve`) et qu'un modèle est installé (`ollama pull llama3`).";

const SYSTEM_PROMPT = `Tu es AtlasBot, l'assistant officiel d'AtlasWay, une plateforme marocaine de covoiturage.

Règles :
- Réponds en français. Si l'utilisateur écrit en darija (arabe marocain, en lettres latines ou arabes), réponds en darija.
- Sois clair, chaleureux et concis (quelques phrases, pas de pavés).
- Tu sais aider sur : la réservation d'un trajet, l'annulation d'une réservation, les prix et le partage des frais, la sécurité (vérification d'identité, numéros d'urgence, signalement), et les questions de support général sur l'utilisation de l'application.
- Si la question sort de ce périmètre (politique, météo, code, sujets sans rapport avec AtlasWay...), réponds poliment que tu es spécialisé dans AtlasWay et redirige l'utilisateur vers le support si besoin.
- Ne donne jamais d'information inventée sur un trajet, un prix ou un utilisateur précis : tu n'as pas accès à la base de données, oriente vers l'application ou le support pour les cas concrets.`;

let cachedModel = null;

async function listModels() {
  const res = await fetch(`${OLLAMA_URL}/api/tags`);
  if (!res.ok) throw new Error(`Ollama a répondu avec le statut ${res.status}`);
  const data = await res.json();
  return (data.models || []).map((m) => m.name.split(':')[0]);
}

async function checkOllamaAvailable() {
  try {
    const models = await listModels();
    if (models.includes(PRIMARY_MODEL)) {
      cachedModel = PRIMARY_MODEL;
    } else if (models.includes(FALLBACK_MODEL)) {
      cachedModel = FALLBACK_MODEL;
      console.warn(`[AtlasBot] Modèle "${PRIMARY_MODEL}" introuvable, utilisation de "${FALLBACK_MODEL}".`);
    } else {
      cachedModel = null;
      console.warn(`[AtlasBot] Aucun modèle installé parmi "${PRIMARY_MODEL}" / "${FALLBACK_MODEL}". Lancez : ollama pull ${PRIMARY_MODEL}`);
    }
    console.log(`[AtlasBot] Ollama disponible ✓ (modèle utilisé : ${cachedModel || 'aucun — à installer'})`);
    return true;
  } catch (err) {
    cachedModel = null;
    console.warn(`[AtlasBot] Ollama indisponible sur ${OLLAMA_URL} (${err.message}). AtlasBot ne pourra pas répondre tant qu'Ollama n'est pas lancé.`);
    return false;
  }
}

async function callModel(modelName, messages) {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: modelName, messages, stream: false }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ollama (${modelName}) a répondu ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.message?.content?.trim() || '';
}

async function chatWithOllama(message, history = []) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: message },
  ];

  const firstModel = cachedModel || PRIMARY_MODEL;
  try {
    return await callModel(firstModel, messages);
  } catch (err) {
    if (firstModel === FALLBACK_MODEL) throw new Error(UNAVAILABLE_MSG);
    try {
      const reply = await callModel(FALLBACK_MODEL, messages);
      cachedModel = FALLBACK_MODEL;
      return reply;
    } catch {
      throw new Error(UNAVAILABLE_MSG);
    }
  }
}

module.exports = { checkOllamaAvailable, chatWithOllama };
