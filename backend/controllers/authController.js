const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { validationResult } = require('express-validator');

const { User, VerificationCode } = require('../models');
const { sendVerificationEmail } = require('../services/emailService');

const googleClientIds = (process.env.GOOGLE_CLIENT_IDS || process.env.GOOGLE_CLIENT_ID || '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);

const googleClient = googleClientIds.length ? new OAuth2Client() : null;

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function getFirstError(req) {
  const errors = validationResult(req);
  return errors.isEmpty() ? null : errors.array()[0].msg;
}

async function verifyGoogleToken(idToken) {
  if (!googleClient || googleClientIds.length === 0) {
    const error = new Error('Google OAuth non configure.');
    error.status = 500;
    throw error;
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: googleClientIds,
  });

  return ticket.getPayload();
}

async function register(req, res, next) {
  try {
    const validationError = getFirstError(req);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { firstName, lastName, email, password } = req.body;
    const existing = await User.findOne({ where: { email } });

    if (existing && existing.verified) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [user] = await User.findOrCreate({
      where: { email },
      defaults: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'user',
        verified: false,
      },
    });

    if (existing && !existing.verified) {
      await existing.update({
        firstName,
        lastName,
        password: hashedPassword,
        verified: false,
      });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await VerificationCode.destroy({ where: { email } });
    await VerificationCode.create({ email, code, expiresAt });

    res.status(201).json({
      message: 'Code envoyé. Vérifiez votre email.',
      email,
      verificationRequired: true,
    });

    sendVerificationEmail({ to: email, firstName, code }).catch(err =>
      console.error('Email send failed:', err.message)
    );
  } catch (error) {
    return next(error);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const validationError = getFirstError(req);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { email, code } = req.body;
    const entry = await VerificationCode.findOne({ where: { email, code } });

    if (!entry) {
      return res.status(400).json({ message: 'Code incorrect.' });
    }

    if (new Date(entry.expiresAt).getTime() < Date.now()) {
      await entry.destroy();
      return res.status(400).json({ message: 'Code expiré.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    await user.update({ verified: true, onboardingDone: false });
    await entry.destroy();

    return res.json({
      message: 'Email vérifié avec succès.',
      token: signToken(user),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        onboardingDone: false,
        isDriver: false,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function resendCode(req, res, next) {
  try {
    const validationError = getFirstError(req);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || user.verified) {
      return res.status(404).json({ message: 'Utilisateur introuvable ou déjà vérifié.' });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await VerificationCode.destroy({ where: { email } });
    await VerificationCode.create({ email, code, expiresAt });

    res.json({ message: 'Nouveau code envoyé.' });

    sendVerificationEmail({ to: email, firstName: user.firstName, code }).catch(err =>
      console.error('Email send failed:', err.message)
    );
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const validationError = getFirstError(req);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Compte bloqué.' });
    }

    if (!user.verified) {
      return res.status(403).json({ message: 'Compte non vérifié. Vérifiez votre email.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    return res.json({
      message: 'Connexion réussie.',
      token: signToken(user),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function googleLogin(req, res, next) {
  try {
    const validationError = getFirstError(req);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'idToken requis.' });
    }

    let payload;
    try {
      payload = await verifyGoogleToken(idToken);
    } catch (error) {
      const status = error.status || 401;
      const message = status === 500 ? 'Google OAuth non configure.' : 'Jeton Google invalide.';
      return res.status(status).json({ message });
    }

    const email = payload?.email?.toLowerCase();
    if (!email) {
      return res.status(400).json({ message: 'Email Google introuvable.' });
    }

    if (payload.email_verified === false) {
      return res.status(401).json({ message: 'Email Google non verifie.' });
    }

    const googleId = payload.sub;
    const givenName = payload.given_name || payload.name?.split(' ')[0] || 'Utilisateur';
    const familyName = payload.family_name || payload.name?.split(' ').slice(1).join(' ') || 'Google';
    const photo = payload.picture || null;

    let user = await User.findOne({ where: { googleId } });
    if (!user) {
      user = await User.findOne({ where: { email } });
    }

    if (user && user.status === 'blocked') {
      return res.status(403).json({ message: 'Compte bloque.' });
    }

    if (!user) {
      const tempPassword = crypto.randomBytes(24).toString('hex');
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      user = await User.create({
        firstName: givenName,
        lastName: familyName,
        email,
        password: hashedPassword,
        role: 'user',
        verified: true,
        onboardingDone: false,
        googleId,
        photo,
      });
    } else {
      const updates = {};
      if (!user.googleId) updates.googleId = googleId;
      if (!user.verified) updates.verified = true;
      if (!user.photo && photo) updates.photo = photo;
      if (Object.keys(updates).length > 0) {
        await user.update(updates);
      }
    }

    return res.json({
      message: 'Connexion Google reussie.',
      token: signToken(user),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        onboardingDone: user.onboardingDone,
        isDriver: user.isDriver,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const validationError = getFirstError(req);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { email, currentPassword, newPassword } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await user.update({ password: hashedPassword });

    return res.json({ message: 'Mot de passe mis à jour.' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  verifyEmail,
  resendCode,
  login,
  googleLogin,
  changePassword,
};
