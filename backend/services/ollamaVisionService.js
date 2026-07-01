const fs = require('fs');

const OLLAMA_URL    = process.env.OLLAMA_URL || 'http://localhost:11434';
const VISION_MODEL   = process.env.OLLAMA_VISION_MODEL || 'llava';
const UNAVAILABLE_MSG = "La vérification automatique des documents est momentanément indisponible. Vérifiez qu'Ollama est lancé et que le modèle vision est installé (`ollama pull llava`).";

let visionModelReady = null;

const PROMPTS = {
  cin: `Tu analyses la photo d'un document d'identité censé être une Carte d'Identité Nationale (CIN) marocaine.
Réponds UNIQUEMENT avec un objet JSON strict de la forme {"valide": true|false, "raison": "..."}.
"valide" doit être true seulement si l'image montre clairement un document d'identité marocain lisible (recto avec photo, nom, numéro de carte).
Si l'image est floue, coupée, illisible, ou n'est pas une carte d'identité, mets "valide": false et explique brièvement pourquoi en français dans "raison".`,
  permis: `Tu analyses la photo d'un document censé être un permis de conduire marocain.
Réponds UNIQUEMENT avec un objet JSON strict de la forme {"valide": true|false, "raison": "..."}.
"valide" doit être true seulement si l'image montre clairement un permis de conduire lisible (avec photo, catégories de permis).
Si l'image est floue, illisible, ou n'est manifestement pas un permis de conduire, mets "valide": false et explique brièvement pourquoi en français dans "raison".`,
  voiture: `Tu analyses une photo censée montrer un véhicule (voiture).
Réponds UNIQUEMENT avec un objet JSON strict de la forme {"valide": true|false, "raison": "..."}.
"valide" doit être true seulement si l'image montre clairement une voiture (vue extérieure).
Si l'image montre un selfie, une personne, un document, ou n'importe quoi d'autre qu'une voiture, mets "valide": false et explique brièvement pourquoi en français dans "raison".`,
};

async function listModels() {
  const res = await fetch(`${OLLAMA_URL}/api/tags`);
  if (!res.ok) throw new Error(`Ollama a répondu avec le statut ${res.status}`);
  const data = await res.json();
  return (data.models || []).map((m) => m.name.split(':')[0]);
}

async function checkVisionModelAvailable() {
  try {
    const models = await listModels();
    visionModelReady = models.includes(VISION_MODEL);
    if (visionModelReady) {
      console.log(`[Vérification conducteur] Modèle vision disponible ✓ (${VISION_MODEL})`);
    } else {
      console.warn(`[Vérification conducteur] Modèle vision "${VISION_MODEL}" non installé. Lancez : ollama pull ${VISION_MODEL}`);
    }
    return visionModelReady;
  } catch (err) {
    visionModelReady = false;
    console.warn(`[Vérification conducteur] Ollama indisponible sur ${OLLAMA_URL} (${err.message}).`);
    return false;
  }
}

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Réponse IA invalide (pas de JSON détecté).');
  const parsed = JSON.parse(match[0]);
  return {
    valide: parsed.valide === true,
    raison: typeof parsed.raison === 'string' ? parsed.raison : '',
  };
}

async function verifyDocument(imagePath, kind) {
  if (visionModelReady === false) throw new Error(UNAVAILABLE_MSG);

  const prompt = PROMPTS[kind];
  if (!prompt) throw new Error(`Type de document inconnu : ${kind}`);

  const base64 = fs.readFileSync(imagePath, { encoding: 'base64' });

  let res;
  try {
    res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: VISION_MODEL,
        messages: [{ role: 'user', content: prompt, images: [base64] }],
        stream: false,
      }),
    });
  } catch {
    throw new Error(UNAVAILABLE_MSG);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ollama (${VISION_MODEL}) a répondu ${res.status}: ${text || UNAVAILABLE_MSG}`);
  }

  const data = await res.json();
  const content = data.message?.content || '';

  try {
    return extractJson(content);
  } catch {
    return { valide: false, raison: "Réponse de l'IA illisible, réessayez avec une image plus nette." };
  }
}

module.exports = { checkVisionModelAvailable, verifyDocument };
