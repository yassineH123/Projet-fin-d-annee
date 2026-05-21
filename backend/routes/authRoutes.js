const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  [
    body('firstName').trim().notEmpty().withMessage('Le prénom est requis.'),
    body('lastName').trim().notEmpty().withMessage('Le nom est requis.'),
    body('email').isEmail().withMessage('Email invalide.'),
    body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères.'),
  ],
  authController.register
);

router.post(
  '/verify-email',
  [body('email').isEmail().withMessage('Email invalide.'), body('code').isLength({ min: 6, max: 6 }).withMessage('Code OTP invalide.')],
  authController.verifyEmail
);

router.post('/resend-code', [body('email').isEmail().withMessage('Email invalide.')], authController.resendCode);

router.post(
  '/login',
  [body('email').isEmail().withMessage('Email invalide.'), body('password').notEmpty().withMessage('Le mot de passe est requis.')],
  authController.login
);

router.post(
  '/google',
  [body('idToken').notEmpty().withMessage('idToken requis.')],
  authController.googleLogin
);

router.post(
  '/change-password',
  [
    body('email').isEmail().withMessage('Email invalide.'),
    body('currentPassword').notEmpty().withMessage('Mot de passe actuel requis.'),
    body('newPassword').isLength({ min: 8 }).withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères.'),
  ],
  authController.changePassword
);

module.exports = router;
