const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Budget générique pour l'inscription et le changement de mot de passe.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives. Réessayez dans quelques minutes.' },
});

// Budget dédié à la connexion (anti brute-force de mot de passe), séparé des
// autres routes /auth pour qu'un pic sur l'une n'épuise pas le quota des autres.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives de connexion. Réessayez dans quelques minutes.' },
});

// Budget des flux à code OTP (vérification, renvoi, mot de passe oublié/réinitialisation),
// limité par EMAIL (et non par IP) pour empêcher un brute-force du code à 6 chiffres
// réparti sur plusieurs IP contre un même compte.
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => String(req.body?.email || '').trim().toLowerCase() || req.ip,
  message: { message: 'Trop de tentatives pour ce compte. Réessayez dans quelques minutes.' },
});

router.post(
  '/register',
  authLimiter,
  [
    body('firstName').trim().notEmpty().withMessage('Le prénom est requis.'),
    body('lastName').trim().notEmpty().withMessage('Le nom est requis.'),
    body('email').isEmail().withMessage('Email invalide.'),
    body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères.'),
    body('phone').optional({ values: 'falsy' }).isMobilePhone().withMessage('Numéro de téléphone invalide.'),
  ],
  authController.register
);

router.post(
  '/verify-email',
  otpLimiter,
  [body('email').isEmail().withMessage('Email invalide.'), body('code').isLength({ min: 6, max: 6 }).withMessage('Code OTP invalide.')],
  authController.verifyEmail
);

router.post('/resend-code', otpLimiter, [body('email').isEmail().withMessage('Email invalide.')], authController.resendCode);

router.post(
  '/login',
  loginLimiter,
  [body('email').isEmail().withMessage('Email invalide.'), body('password').notEmpty().withMessage('Le mot de passe est requis.')],
  authController.login
);

router.post('/forgot-password', otpLimiter, [body('email').isEmail().withMessage('Email invalide.')], authController.forgotPassword);

router.post(
  '/reset-password',
  otpLimiter,
  [
    body('email').isEmail().withMessage('Email invalide.'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Code invalide.'),
    body('newPassword').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères.'),
  ],
  authController.resetPassword
);

router.post(
  '/change-password',
  authenticateToken,
  authLimiter,
  [
    body('currentPassword').notEmpty().withMessage('Mot de passe actuel requis.'),
    body('newPassword').isLength({ min: 8 }).withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères.'),
  ],
  authController.changePassword
);

module.exports = router;
