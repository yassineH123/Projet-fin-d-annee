import express      from "express";
import cors         from "cors";
import bcrypt       from "bcryptjs";
import nodemailer   from "nodemailer";
import dotenv       from "dotenv";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ─────────────────────────────────────────────────────────
// BASE DE DONNÉES EN MÉMOIRE (remplacée par MongoDB plus tard)
// ─────────────────────────────────────────────────────────
const users        = []; // { id, prenom, nom, email, passwordHash, verified }
const pendingCodes = []; // { email, code, expiresAt }

// ─────────────────────────────────────────────────────────
// NODEMAILER — Gmail SMTP
// ─────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Génère un code à 6 chiffres
const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Envoie le code par email
const sendVerificationEmail = async (email, prenom, code) => {
  await transporter.sendMail({
    from: `"BlablacarMaroc" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Votre code de vérification — BlablacarMaroc",
    html: `
      <div style="font-family:Poppins,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f6f7f8;border-radius:16px;">
        <h2 style="color:#00838F;margin-bottom:8px;">BlablacarMaroc</h2>
        <p style="color:#1a1f36;font-size:16px;">Bonjour <strong>${prenom}</strong>,</p>
        <p style="color:#6b7385;margin-bottom:24px;">Voici votre code de vérification :</p>
        <div style="background:#fff;border:2px solid #00838F;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
          <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:#00838F;">${code}</span>
        </div>
        <p style="color:#9aa0b2;font-size:13px;">Ce code expire dans <strong>10 minutes</strong>.</p>
        <p style="color:#9aa0b2;font-size:13px;">Si vous n'avez pas créé de compte, ignorez cet email.</p>
      </div>
    `,
  });
};

// ─────────────────────────────────────────────────────────
// ROUTES AUTH
// ─────────────────────────────────────────────────────────

// POST /api/auth/register
app.post("/api/auth/register", async (req, res) => {
  const { prenom, nom, email, password } = req.body;

  // Vérification champs
  if (!prenom || !nom || !email || !password) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  // Email déjà utilisé
  const existing = users.find((u) => u.email === email);
  if (existing && existing.verified) {
    return res.status(409).json({ message: "Cet email est déjà utilisé." });
  }

  // Hash du mot de passe
  const passwordHash = await bcrypt.hash(password, 12);

  // Supprime l'ancien user non vérifié si existe
  const idx = users.findIndex((u) => u.email === email);
  if (idx !== -1) users.splice(idx, 1);

  // Crée le user (non vérifié)
  users.push({
    id: Date.now(),
    prenom,
    nom,
    email,
    passwordHash,
    verified: false,
  });

  // Génère et stocke le code (valide 10 min)
  const code      = generateCode();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  // Supprime l'ancien code si existe
  const ci = pendingCodes.findIndex((c) => c.email === email);
  if (ci !== -1) pendingCodes.splice(ci, 1);
  pendingCodes.push({ email, code, expiresAt });

  // Envoie l'email
  try {
    await sendVerificationEmail(email, prenom, code);
  } catch (err) {
    console.error("Erreur envoi email:", err.message);
    return res.status(500).json({ message: "Erreur lors de l'envoi de l'email. Vérifiez votre .env" });
  }

  return res.status(201).json({ message: "Code envoyé. Vérifiez votre email." });
});

// POST /api/auth/verify-email
app.post("/api/auth/verify-email", (req, res) => {
  const { email, code } = req.body;

  const entry = pendingCodes.find((c) => c.email === email);

  if (!entry) {
    return res.status(400).json({ message: "Aucun code en attente pour cet email." });
  }

  if (Date.now() > entry.expiresAt) {
    // Supprime le code expiré
    pendingCodes.splice(pendingCodes.indexOf(entry), 1);
    return res.status(400).json({ message: "Code expiré. Demandez un nouveau code." });
  }

  if (entry.code !== code) {
    return res.status(400).json({ message: "Code incorrect." });
  }

  // Marque le user comme vérifié
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });

  user.verified = true;

  // Supprime le code utilisé
  pendingCodes.splice(pendingCodes.indexOf(entry), 1);

  return res.status(200).json({
    message: "Email vérifié avec succès.",
    prenom: user.prenom,
    email:  user.email,
  });
});

// POST /api/auth/resend-code
app.post("/api/auth/resend-code", async (req, res) => {
  const { email } = req.body;

  const user = users.find((u) => u.email === email && !u.verified);
  if (!user) return res.status(404).json({ message: "Utilisateur introuvable ou déjà vérifié." });

  const code      = generateCode();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  const ci = pendingCodes.findIndex((c) => c.email === email);
  if (ci !== -1) pendingCodes.splice(ci, 1);
  pendingCodes.push({ email, code, expiresAt });

  try {
    await sendVerificationEmail(email, user.prenom, code);
  } catch (err) {
    return res.status(500).json({ message: "Erreur lors de l'envoi de l'email." });
  }

  return res.status(200).json({ message: "Nouveau code envoyé." });
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis." });
  }

  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(401).json({ message: "Email ou mot de passe incorrect." });
  }

  if (!user.verified) {
    return res.status(403).json({ message: "Compte non vérifié. Vérifiez votre email." });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ message: "Email ou mot de passe incorrect." });
  }

  return res.status(200).json({
    message: "Connexion réussie.",
    prenom: user.prenom,
    email:  user.email,
  });
});

// ─────────────────────────────────────────────────────────
// DÉMARRAGE
// ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Serveur BlablacarMaroc démarré sur http://localhost:${PORT}`);
});
