const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const { User, VerificationCode } = require('../models');
const { record: recordLogin } = require('./loginHistoryController');
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

    const { firstName, lastName, email, password, phone, referralCode: refCode, verificationMethod } = req.body;
    const existing = await User.findOne({ email });

    if (existing && existing.verified) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
    }

    let referredById = null;
    if (refCode) {
      const referrer = await User.findOne({ referralCode: refCode });
      if (referrer) referredById = referrer.id;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newReferralCode = generateReferralCode();

    if (!existing) {
      await User.create({ firstName, lastName, email, password: hashedPassword, phone: phone || null, role: 'user', verified: false, referralCode: newReferralCode, referredBy: referredById });
    } else {
      existing.set({ firstName, lastName, password: hashedPassword, phone: phone || null, referralCode: existing.referralCode || newReferralCode, referredBy: referredById || existing.referredBy });
      await existing.save();
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await VerificationCode.deleteMany({ email });
    await VerificationCode.create({ email, code, expiresAt });

    const useSMS = verificationMethod === 'sms' && phone;

    res.status(201).json({
      message: useSMS ? 'Code envoyé par SMS.' : 'Code envoyé par email.',
      email,
      verificationRequired: true,
    });

    if (useSMS) {
      sendVerificationSMS({ to: phone, code }).catch(err =>
        console.error('SMS send failed:', err.message)
      );
    } else {
      console.log(`[VERIFY CODE] ${email} => ${code}`);
    sendVerificationEmail({ to: email, firstName, code }).catch(err =>
        console.error('[EMAIL ERROR]', err.message)
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
    const entry = await VerificationCode.findOne({ email, code });

    if (!entry) {
      return res.status(400).json({ message: 'Code incorrect.' });
    }

    if (new Date(entry.expiresAt).getTime() < Date.now()) {
      await entry.deleteOne();
      return res.status(400).json({ message: 'Code expiré.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    user.set({ verified: true, onboardingDone: false });
    await user.save();
    await entry.deleteOne();

    // Créditer le parrain de 10 DH
    if (user.referredBy) {
      await User.findByIdAndUpdate(user.referredBy, { $inc: { referralCredits: 10 } });
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
    const user = await User.findOne({ email });

    if (!user || user.verified) {
      return res.status(404).json({ message: 'Utilisateur introuvable ou déjà vérifié.' });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await VerificationCode.deleteMany({ email });
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
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Ce compte a été banni.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Ce compte a été désactivé.' });
    }

    if (!user.verified) {
      return res.status(403).json({ message: 'Compte non vérifié. Vérifiez votre email.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    if (!user.referralCode) {
      user.set({ referralCode: generateReferralCode() });
      await user.save();
    }

    recordLogin(user.id, req, true);

    return res.json({
      message: 'Connexion réussie.',
      token: signToken(user),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        walletBalance: user.walletBalance,
        level: user.level,
        badges: user.badges,
      },
    });
  } catch (error) {
    recordLogin(null, req, false);
    return next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Aucun compte avec cet email.' });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await VerificationCode.deleteMany({ email });
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
    const entry = await VerificationCode.findOne({ email, code });

    if (!entry) return res.status(400).json({ message: 'Code incorrect.' });
    if (new Date(entry.expiresAt).getTime() < Date.now()) {
      await entry.deleteOne();
      return res.status(400).json({ message: 'Code expiré.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.set({ password: hashedPassword });
    await user.save();
    await entry.deleteOne();

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
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.set({ password: hashedPassword });
    await user.save();

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
