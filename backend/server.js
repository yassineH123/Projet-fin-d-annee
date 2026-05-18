require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const { sequelize, ensureDatabaseExists } = require('./config/database');
const { User, Ride, Booking, Review, Conversation, Message, VerificationCode } = require('./models');
const { seedAuthUsers } = require('./services/seedService');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes     = require('./routes/authRoutes');
const userRoutes     = require('./routes/userRoutes');
const rideRoutes     = require('./routes/rideRoutes');
const bookingRoutes  = require('./routes/bookingRoutes');
const reviewRoutes   = require('./routes/reviewRoutes');
const messageRoutes  = require('./routes/messageRoutes');
const adminRoutes    = require('./routes/adminRoutes');
const superadminRoutes = require('./routes/superadminRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '5mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

// Servir les uploads statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'atlasway-backend' }));

app.use('/api/auth',       authRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/rides',      rideRoutes);
app.use('/api/bookings',   bookingRoutes);
app.use('/api/reviews',    reviewRoutes);
app.use('/api/messages',   messageRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/superadmin', superadminRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    await seedAuthUsers();
    app.listen(PORT, () => console.log(`✅ AtlasWay backend → http://localhost:${PORT}`));
  } catch (error) {
    console.error('❌ Erreur démarrage:', error);
    process.exit(1);
  }
}

start();
