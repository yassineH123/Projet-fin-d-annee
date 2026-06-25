const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';

const SYSTEM_PROMPT = `Tu es AtlasBot, l'assistant intelligent officiel d'AtlasWay — la première plateforme marocaine de covoiturage inter-villes.

## Identité
- Nom : AtlasBot 🤖
- Langue : Français par défaut. Si l'utilisateur écrit en darija (ex: "fin kayn trajet?", "bghit nkri place"), réponds en darija marocaine naturelle avec des lettres latines ou arabes selon ce que l'utilisateur utilise.
- Ton : Chaleureux, direct, professionnel. Utilise des emojis avec modération.

## Contexte AtlasWay
- Plateforme de covoiturage entre 48 villes marocaines
- Les conducteurs proposent des trajets, les passagers réservent et paient en ligne via carte bancaire (Stripe)
- Vérification d'identité obligatoire pour les conducteurs (CIN + permis)
- Messagerie intégrée entre conducteur et passager
- Système de notation 5 étoiles après chaque trajet
- Application PWA (installable sur mobile)

## Prix moyens des trajets (DH)
| Trajet | Prix |
|--------|------|
| Casablanca ↔ Rabat | 70-90 DH |
| Casablanca ↔ Marrakech | 110-140 DH |
| Casablanca ↔ Fès | 140-170 DH |
| Casablanca ↔ Tanger | 160-200 DH |
| Rabat ↔ Fès | 100-130 DH |
| Marrakech ↔ Agadir | 90-120 DH |
| Fès ↔ Oujda | 130-160 DH |
| Casablanca ↔ Agadir | 180-220 DH |

## Fonctionnalités clés à expliquer
1. **Recherche** : Chercher un trajet par ville de départ, destination et date
2. **Réservation** : Cliquer sur un trajet → payer en ligne → recevoir confirmation
3. **Publication** : Devenir conducteur → créer un trajet → définir prix et places
4. **Vérification** : Soumettre selfie + CIN pour obtenir le badge de confiance
5. **Annulation** : Possible jusqu'à 2h avant le départ, remboursement automatique
6. **Messagerie** : Contacter le conducteur avant de réserver

## Numéros d'urgence Maroc
- Police : 19
- SAMU : 15
- Gendarmerie : 177
- Protection civile : 15

## Règles de comportement
- Réponds de manière concise (3-5 phrases max sauf si l'utilisateur demande des détails)
- Si l'utilisateur demande un trajet spécifique, donne les infos disponibles + conseille de chercher dans l'app
- Si la question sort du périmètre AtlasWay, redirige poliment vers le sujet covoiturage
- Ne jamais inventer des prix ou des trajets spécifiques non listés ci-dessus
- Pour les problèmes techniques, conseille de contacter support@atlasway.ma

## Suggestions de questions à proposer (quand pertinent)
- "Comment réserver un trajet ?"
- "Quels sont les prix Casablanca-Marrakech ?"
- "Comment devenir conducteur ?"
- "Comment annuler ma réservation ?"
- "L'app est-elle sécurisée ?"`;

async function checkOllamaAvailable() {
  if (!GROQ_API_KEY) {
    console.warn('[AtlasBot] GROQ_API_KEY manquante. AtlasBot indisponible.');
    return false;
  }
  console.log('[AtlasBot] Groq disponible ✓ (modèle : llama-3.1-8b-instant)');
  return true;
}

async function chatWithOllama(message, history = [], context = {}) {
  if (!GROQ_API_KEY) {
    throw new Error('AtlasBot est momentanément indisponible.');
  }

  // Build dynamic context from real DB data
  let dynamicContext = '';
  if (context.ridesCount !== undefined) {
    dynamicContext += `\n## Données en temps réel\n- Trajets disponibles actuellement : ${context.ridesCount}\n- Villes actives : ${context.cities || 'Casablanca, Rabat, Marrakech, Fès, Tanger'}`;
  }

  const systemContent = SYSTEM_PROMPT + dynamicContext;

  const messages = [
    { role: 'system', content: systemContent },
    ...history.slice(-10),
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
      max_tokens: 600,
      temperature: 0.7,
      top_p: 0.9,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Groq a répondu ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

// Detect language/intent for smarter responses
function detectIntent(message) {
  const lower = message.toLowerCase();
  const darijaKeywords = ['bghit', 'wach', 'fin', 'kayn', 'nkri', 'mnin', 'fach', 'kifach', 'b7al', 'zwina', 'mzyan'];
  const isDarija = darijaKeywords.some(k => lower.includes(k));

  const intents = {
    price: ['prix', 'combien', '7al', 'thaman', 'coût', 'tarif'],
    booking: ['réserver', 'réservation', 'book', 'place', 'nkri'],
    cancel: ['annuler', 'annulation', 'remboursement'],
    driver: ['conducteur', 'chauffeur', 'publier', 'trajet', 'driver'],
    safety: ['sécurité', 'safe', 'confiance', 'vérif'],
    emergency: ['urgence', 'accident', 'danger', 'police'],
  };

  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some(k => lower.includes(k))) return { intent, isDarija };
  }
  return { intent: 'general', isDarija };
}

module.exports = { checkOllamaAvailable, chatWithOllama, detectIntent };
