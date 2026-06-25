require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');

// Mini app Express pour les tests (sans lancer le vrai serveur)
const app = express();
app.use(express.json());
app.use('/auth', require('../routes/authRoutes'));

const TEST_EMAIL = `test_${Date.now()}@atlasway.ma`;
const TEST_PASS  = 'Test1234!';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/atlasway_test');
});

afterAll(async () => {
  // Nettoyage : supprimer l'utilisateur de test
  const { User, VerificationCode } = require('../models');
  await User.deleteOne({ email: TEST_EMAIL });
  await VerificationCode.deleteMany({ email: TEST_EMAIL });
  await mongoose.disconnect();
});

describe('POST /auth/register', () => {
  it('refuse si email manquant', async () => {
    const res = await request(app).post('/auth/register').send({ password: TEST_PASS });
    expect(res.status).toBe(400);
  });

  it('refuse si mot de passe trop court', async () => {
    const res = await request(app).post('/auth/register').send({
      firstName: 'Test', lastName: 'User', email: TEST_EMAIL, password: '123',
    });
    expect(res.status).toBe(400);
  });

  it('crée un utilisateur avec des données valides', async () => {
    const res = await request(app).post('/auth/register').send({
      firstName: 'Adam', lastName: 'Test', email: TEST_EMAIL, password: TEST_PASS,
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('verificationRequired', true);
  });

  it('refuse un email déjà utilisé (vérifié)', async () => {
    // Forcer la vérification pour tester le doublon
    const { User } = require('../models');
    await User.updateOne({ email: TEST_EMAIL }, { verified: true });

    const res = await request(app).post('/auth/register').send({
      firstName: 'Adam', lastName: 'Test', email: TEST_EMAIL, password: TEST_PASS,
    });
    expect(res.status).toBe(409);
  });
});

describe('POST /auth/login', () => {
  it('refuse si mot de passe incorrect', async () => {
    const res = await request(app).post('/auth/login').send({
      email: TEST_EMAIL, password: 'mauvais_mdp',
    });
    expect(res.status).toBe(401);
  });

  it('connecte avec les bons credentials', async () => {
    const res = await request(app).post('/auth/login').send({
      email: TEST_EMAIL, password: TEST_PASS,
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.token).toMatch(/^eyJ/); // JWT commence par eyJ
  });

  it('le token contient id, email et role', async () => {
    const res = await request(app).post('/auth/login').send({
      email: TEST_EMAIL, password: TEST_PASS,
    });
    const payload = JSON.parse(Buffer.from(res.body.token.split('.')[1], 'base64').toString());
    expect(payload).toHaveProperty('id');
    expect(payload).toHaveProperty('email', TEST_EMAIL);
    expect(payload).toHaveProperty('role', 'user');
    expect(payload).toHaveProperty('exp'); // expire bien
  });
});

describe('POST /auth/forgot-password', () => {
  it('retourne 404 si email inconnu', async () => {
    const res = await request(app).post('/auth/forgot-password').send({
      email: 'inconnu@atlasway.ma',
    });
    expect(res.status).toBe(404);
  });

  it('envoie un code si email connu', async () => {
    const res = await request(app).post('/auth/forgot-password').send({
      email: TEST_EMAIL,
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
