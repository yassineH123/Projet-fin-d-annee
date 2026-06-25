const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';

const SYSTEM_PROMPT = `Tu es AtlasBot, l'assistant officiel d'AtlasWay, une plateforme marocaine de covoiturage.

Contexte AtlasWay :
- Plateforme de covoiturage entre villes marocaines (Casablanca, Rabat, Fès, Marrakech, Tanger, Agadir, Meknès, Oujda, Tétouan, Nador...)
- Les conducteurs proposent des trajets, les passagers réservent et paient en ligne
- Prix moyens : Casablanca-Rabat ~80 DH, Casablanca-Marrakech ~120 DH, Casablanca-Fès ~150 DH
- Vérification d'identité obligatoire pour les conducteurs (CIN + permis de conduire)
- Paiement sécurisé par carte bancaire via Stripe
- Messagerie intégrée entre conducteur et passager
- Système de notation et avis après chaque trajet
- Numéro d'urgence national : 19 (Police), 15 (SAMU), 177 (Gendarmerie)

Règles :
- Réponds en français. Si l'utilisateur écrit en darija (arabe marocain, en lettres latines ou arabes), réponds en darija.
- Sois clair, chaleureux et concis (quelques phrases, pas de pavés).
- Tu sais aider sur : la réservation d'un trajet, l'annulation, les prix, la sécurité, la vérification conducteur, les paiements, et le support général.
- Si la question sort du périmètre AtlasWay, réponds poliment que tu es spécialisé dans AtlasWay.
- Ne donne jamais d'information inventée sur un trajet ou utilisateur précis : tu n'as pas accès à la base de données en temps réel.`;

async function checkOllamaAvailable() {
  if (!GROQ_API_KEY) {
    console.warn('[AtlasBot] GROQ_API_KEY manquante. AtlasBot indisponible.');
    return false;
  }
  console.log('[AtlasBot] Groq disponible ✓ (modèle : llama3-8b-8192)');
  return true;
}

async function chatWithOllama(message, history = []) {
  if (!GROQ_API_KEY) {
    throw new Error('AtlasBot est momentanément indisponible. Clé API Groq manquante.');
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: message },
  ];

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Groq a répondu ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

module.exports = { checkOllamaAvailable, chatWithOllama };
