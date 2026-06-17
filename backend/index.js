require('dotenv').config();
const http      = require('http');
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');
const sequelize = require('./database');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { init: initSocket } = require('./socket');

const User             = require('./models/User');
const Trip             = require('./models/Trip');
const Review           = require('./models/Review');
const Post             = require('./models/Post');
const PostLike         = require('./models/PostLike');
const PostComment      = require('./models/PostComment');
const Notification     = require('./models/Notification');
const Ride             = require('./models/Ride');
const Booking          = require('./models/Booking');
const Conversation     = require('./models/Conversation');
const ConversationMember = require('./models/ConversationMember');
const Message          = require('./models/Message');
const VerificationCode = require('./models/VerificationCode');
const Friendship       = require('./models/Friendship');

/* Associations Feed */
Post.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Post,   { foreignKey: 'userId' });
PostLike.belongsTo(User, { foreignKey: 'userId' });
PostLike.belongsTo(Post, { foreignKey: 'postId' });
Post.hasMany(PostLike,    { foreignKey: 'postId' });
PostComment.belongsTo(User, { foreignKey: 'userId' });
PostComment.belongsTo(Post, { foreignKey: 'postId' });
Post.hasMany(PostComment,   { foreignKey: 'postId' });

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

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected ✓');

    await sequelize.sync({ alter: true });
    console.log('Database synced ✓');

    const { seedAuthUsers } = require('./services/seedService');
    await seedAuthUsers();

    server.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
})();
