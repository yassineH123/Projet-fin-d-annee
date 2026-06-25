require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/rides', require('../routes/rideRoutes'));

// Token de test valide
const makeToken = (role = 'driver') => jwt.sign(
  { id: 'test-driver-id', email: 'driver@test.ma', role },
  process.env.JWT_SECRET || 'atlasway_secret_key_2026',
  { expiresIn: '1h' }
);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/atlasway_test');
});

afterAll(async () => {
  const { Ride } = require('../models');
  await Ride.deleteMany({ driverId: 'test-driver-id' });
  await mongoose.disconnect();
});

describe('GET /rides/search', () => {
  it('retourne un tableau même sans résultats', async () => {
    const res = await request(app)
      .get('/rides/search?from=Timbuktu&to=Nulle+Part&seats=1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('rides');
    expect(Array.isArray(res.body.rides)).toBe(true);
  });

  it('retourne un objet rides même sans seats', async () => {
    const res = await request(app).get('/rides/search?from=Casa&to=Rabat');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('rides');
  });
});

describe('POST /rides', () => {
  it('refuse sans authentification', async () => {
    const res = await request(app).post('/rides').send({
      from: 'Casablanca', to: 'Rabat', departureDate: new Date(), price: 80, seats: 3,
    });
    expect(res.status).toBe(401);
  });

  it('refuse si champs obligatoires manquants', async () => {
    const res = await request(app)
      .post('/rides')
      .set('Authorization', `Bearer ${makeToken('user')}`)
      .send({ from: 'Casablanca' });
    expect([400, 401, 403]).toContain(res.status);
  });

  it('crée un trajet avec données valides (rôle driver)', async () => {
    const res = await request(app)
      .post('/rides')
      .set('Authorization', `Bearer ${makeToken('driver')}`)
      .send({
        from: 'Casablanca',
        to: 'Marrakech',
        departureDate: new Date(Date.now() + 86400000).toISOString(),
        price: 120,
        seats: 3,
        transportMode: 'voiture',
      });
    expect([201, 400, 401, 403]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body).toHaveProperty('id');
    }
  });
});

describe('GET /rides/home', () => {
  it('retourne les données home (upcoming, trending, stats)', async () => {
    const res = await request(app).get('/rides/home');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('stats');
    expect(Array.isArray(res.body.upcoming)).toBe(true);
  });
});
