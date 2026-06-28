require('dotenv').config();
const http      = require('http');
const https     = require('https');
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

// CORP par défaut ('same-origin') partout, sauf sur /uploads (scoping plus bas) où les
// images doivent rester chargeables depuis le domaine web (Vercel), différent du backend (Render).
app.use(helmet());

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://atlasway.ma',
      'https://www.atlasway.ma',
      'https://web-omega-one-58.vercel.app',
      ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
    ]
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    const corsError = new Error(`CORS bloqué: ${origin}`);
    corsError.status = 403;
    cb(corsError);
  },
  credentials: true,
}));

// Le webhook Stripe doit recevoir le body brut (non parsé) pour vérifier la signature
// HMAC — il est donc enregistré avant express.json(), qui consommerait sinon le flux
// et casserait silencieusement la vérification de signature.
app.use(
  '/wallet/stripe/webhook',
  express.raw({ type: 'application/json' }),
  require('./controllers/walletController').stripeWebhook
);

app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Limite générale : protège contre les abus sans gêner l'usage normal
// (la navbar interroge plusieurs endpoints toutes les 30s par utilisateur connecté).
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 2000, standardHeaders: true, legacyHeaders: false }));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'atlasway-backend' }));

// Routes
app.use('/auth',          require('./routes/authRoutes'));
app.use('/users',         require('./routes/userRoutes'));
// CORP 'cross-origin' restreint à /uploads : nécessaire pour que les <img> du frontend
// (autre domaine) puissent charger avatars/photos, sans l'exposer au reste de l'API.
app.use(
  '/uploads',
  helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }),
  require('express').static(require('path').join(__dirname, 'uploads'))
);
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
app.use('/enterprise',    require('./routes/enterpriseRoutes'));

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

    server.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);

      // Self-ping every 14 min to prevent Render free tier from sleeping
      if (process.env.NODE_ENV === 'production') {
        const pingUrl = process.env.RENDER_EXTERNAL_URL
          ? `${process.env.RENDER_EXTERNAL_URL}/health`
          : null;
        if (pingUrl) {
          setInterval(() => {
            https.get(pingUrl, (res) => {
              console.log(`[KeepAlive] ping OK (${res.statusCode})`);
            }).on('error', (err) => {
              console.warn('[KeepAlive] ping failed:', err.message);
            });
          }, 14 * 60 * 1000);
          console.log(`[KeepAlive] Self-ping actif → ${pingUrl}`);
        }
      }
    });
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
})();
