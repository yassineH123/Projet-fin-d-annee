require('dotenv').config();
const http      = require('http');
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');
const { connect } = require('./database');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { init: initSocket } = require('./socket');
const { checkOllamaAvailable } = require('./services/ollamaService');
const { checkVisionModelAvailable } = require('./services/ollamaVisionService');
const { generatePredictions, REFRESH_MS } = require('./services/predictionService');
// Chaque modèle (./models/*.js) définit ses propres champs et "virtuals" Mongoose
// (équivalent des associations Sequelize aliasées) ; voir ./models/index.js.

const app    = express();
const server = http.createServer(app);
initSocket(server);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Limite générale : protège contre les abus sans gêner l'usage normal
// (la navbar interroge plusieurs endpoints toutes les 30s par utilisateur connecté).
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 2000, standardHeaders: true, legacyHeaders: false }));

// Limite stricte dédiée à l'authentification : protection anti brute-force.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives. Réessayez dans quelques minutes.' },
});

app.get('/health', (_req, res) => res.json({ ok: true, service: 'atlasway-backend' }));

// Routes
app.use('/auth',          authLimiter, require('./routes/authRoutes'));
app.use('/users',         require('./routes/userRoutes'));
app.use('/uploads',       require('express').static(require('path').join(__dirname, 'uploads')));
app.use('/trips',         require('./routes/trips')());
app.use('/privacy',       require('./routes/privacy')());
app.use('/admin',         require('./routes/adminRoutes'));
app.use('/superadmin',    require('./routes/superadminRoutes'));
app.use('/posts',         require('./routes/postRoutes'));
app.use('/notifications', require('./routes/notificationRoutes'));
app.use('/friends',       require('./routes/friendRoutes'));
app.use('/messages',      require('./routes/messageRoutes'));
app.use('/bookings',      require('./routes/bookingRoutes'));
app.use('/rides',         require('./routes/rideRoutes'));
app.use('/reviews',       require('./routes/reviewRoutes'));
app.use('/reports',       require('./routes/reportRoutes'));
app.use('/saved-searches', require('./routes/savedSearchRoutes'));
app.use('/chat',          require('./routes/chatRoutes'));
app.use('/verify-driver', require('./routes/driverVerificationRoutes'));
app.use('/predictions',   require('./routes/predictionRoutes'));

// Fonctionnalités importées d'AtlasWay 33
app.use('/waitlist',      require('./routes/waitlistRoutes'));
app.use('/wallet',        require('./routes/walletRoutes'));
app.use('/analytics',     require('./routes/analyticsRoutes'));
app.use('/login-history', require('./routes/loginHistoryRoutes'));
app.use('/favorites',     require('./routes/favoriteRoutes'));
app.use('/ride-alerts',   require('./routes/rideAlertRoutes'));
app.use('/promos',        require('./routes/promoRoutes'));
app.use('/support',       require('./routes/supportRoutes'));
app.use('/emergency',     require('./routes/emergencyRoutes'));
app.use('/stories',       require('./routes/storyRoutes'));
app.use('/groups',        require('./routes/groupRoutes'));
app.use('/events',        require('./routes/eventRoutes'));
app.use('/premium',       require('./routes/premiumRoutes'));
app.use('/export',        require('./routes/exportRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connect();
    console.log('Database connected ✓');

    const { seedAuthUsers } = require('./services/seedService');
    await seedAuthUsers();

    await checkOllamaAvailable();
    await checkVisionModelAvailable();

    generatePredictions().catch((err) => console.warn('[Predictions] génération initiale échouée:', err.message));
    setInterval(() => {
      generatePredictions().catch((err) => console.warn('[Predictions] régénération échouée:', err.message));
    }, REFRESH_MS);

    server.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
})();
