const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const { User, VerificationCode } = require('../models');
const { sendVerificationEmail } = require('../services/emailService');
const { sendVerificationSMS }   = require('../services/smsService');

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

function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `AT-${code}`;
}

async function register(req, res, next) {
  try {
    const validationError = getFirstError(req);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { firstName, lastName, email, password, phone, referralCode: refCode } = req.body;
    const existing = await User.findOne({ where: { email } });

    if (existing && existing.verified) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
    }

    let referredById = null;
    if (refCode) {
      const referrer = await User.findOne({ where: { referralCode: refCode } });
      if (referrer) referredById = referrer.id;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newReferralCode = generateReferralCode();

    await User.findOrCreate({
      where: { email },
      defaults: { firstName, lastName, email, password: hashedPassword, phone: phone || null, role: 'user', verified: false, referralCode: newReferralCode, referredBy: referredById },
    });

    if (existing && !existing.verified) {
      await existing.update({ firstName, lastName, password: hashedPassword, phone: phone || null, referralCode: existing.referralCode || newReferralCode, referredBy: referredById || existing.referredBy });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await VerificationCode.destroy({ where: { email } });
    await VerificationCode.create({ email, code, expiresAt });

    res.status(201).json({
      message: phone ? 'Code envoyé par SMS.' : 'Code envoyé par email.',
      email,
      verificationRequired: true,
    });

    if (phone) {
      sendVerificationSMS({ to: phone, code }).catch(err =>
        console.error('SMS send failed:', err.message)
      );
    } else {
      sendVerificationEmail({ to: email, firstName, code }).catch(err =>
        console.error('Email send failed:', err.message)
      );
    }
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

    // Créditer le parrain de 10 DH
    if (user.referredBy) {
      await User.increment({ referralCredits: 10 }, { where: { id: user.referredBy } });
    }

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

    res.json({ message: user.phone ? 'Nouveau code envoyé par SMS.' : 'Nouveau code envoyé par email.' });

    if (user.phone) {
      sendVerificationSMS({ to: user.phone, code }).catch(err =>
        console.error('SMS send failed:', err.message)
      );
    } else {
      sendVerificationEmail({ to: email, firstName: user.firstName, code }).catch(err =>
        console.error('Email send failed:', err.message)
      );
    }
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

    if (!user.referralCode) {
      await user.update({ referralCode: generateReferralCode() });
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

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Aucun compte avec cet email.' });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await VerificationCode.destroy({ where: { email } });
    await VerificationCode.create({ email, code, expiresAt });

    res.json({ message: 'Code de réinitialisation envoyé.' });

    sendVerificationEmail({ to: email, firstName: user.firstName, code }).catch(err =>
      console.error('Email send failed:', err.message)
    );
  } catch (error) {
    return next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { email, code, newPassword } = req.body;
    const entry = await VerificationCode.findOne({ where: { email, code } });

    if (!entry) return res.status(400).json({ message: 'Code incorrect.' });
    if (new Date(entry.expiresAt).getTime() < Date.now()) {
      await entry.destroy();
      return res.status(400).json({ message: 'Code expiré.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await user.update({ password: hashedPassword });
    await entry.destroy();

    return res.json({ message: 'Mot de passe réinitialisé avec succès.' });
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
  forgotPassword,
  resetPassword,
  changePassword,
};
