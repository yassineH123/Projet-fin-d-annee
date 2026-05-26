require('dotenv').config();
const http    = require('http');
const express = require('express');
const cors    = require('cors');
const rateLimit = require('express-rate-limit');
const sequelize = require('./database');
const { init: initSocket } = require('./socket');

/* ── Models (import triggers sequelize registration) ── */
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
const WaitlistEntry    = require('./models/WaitlistEntry');
const Transaction      = require('./models/Transaction');
const LoginHistory     = require('./models/LoginHistory');
const AuditLog         = require('./models/AuditLog');

/* ── Associations Feed ── */
Post.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Post,   { foreignKey: 'userId' });
PostLike.belongsTo(User, { foreignKey: 'userId' });
PostLike.belongsTo(Post, { foreignKey: 'postId' });
Post.hasMany(PostLike,    { foreignKey: 'postId' });
PostComment.belongsTo(User, { foreignKey: 'userId' });
PostComment.belongsTo(Post, { foreignKey: 'postId' });
Post.hasMany(PostComment,   { foreignKey: 'postId' });

/* ── Associations Waitlist ── */
WaitlistEntry.belongsTo(User, { foreignKey: 'userId', as: 'user' });
WaitlistEntry.belongsTo(Ride, { foreignKey: 'rideId', as: 'ride' });
User.hasMany(WaitlistEntry, { foreignKey: 'userId', as: 'waitlistEntries' });
Ride.hasMany(WaitlistEntry, { foreignKey: 'rideId', as: 'waitlist' });

/* ── Associations Wallet ── */
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Transaction,   { foreignKey: 'userId', as: 'transactions' });

/* ── Associations Login History ── */
LoginHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(LoginHistory,   { foreignKey: 'userId', as: 'loginHistory' });

/* ── Associations Audit ── */
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'actor' });

const app    = express();
const server = http.createServer(app);
initSocket(server);

/* ── Rate limiters ── */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Trop de tentatives. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { message: 'Trop de requêtes. Ralentissez.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors());
app.use(express.json());
app.use(require('./middleware/auditMiddleware'));

/* ── Routes ── */
app.use('/auth',           authLimiter, require('./routes/authRoutes'));
app.use('/users',          apiLimiter,  require('./routes/userRoutes'));
app.use('/uploads',        require('express').static(require('path').join(__dirname, 'uploads')));
app.use('/trips',          require('./routes/trips')());
app.use('/privacy',        require('./routes/privacy')());
app.use('/admin',          require('./routes/admin')());
app.use('/superadmin',     require('./routes/superadmin')());
app.use('/posts',          apiLimiter, require('./routes/postRoutes'));
app.use('/notifications',  apiLimiter, require('./routes/notificationRoutes'));
app.use('/friends',        apiLimiter, require('./routes/friendRoutes'));
app.use('/messages',       apiLimiter, require('./routes/messageRoutes'));
app.use('/bookings',       apiLimiter, require('./routes/bookingRoutes'));
app.use('/rides',          apiLimiter, require('./routes/rideRoutes'));
app.use('/reviews',        apiLimiter, require('./routes/reviewRoutes'));
app.use('/reports',        apiLimiter, require('./routes/reportRoutes'));
app.use('/waitlist',       apiLimiter, require('./routes/waitlistRoutes'));
app.use('/wallet',         apiLimiter, require('./routes/walletRoutes'));
app.use('/analytics',      apiLimiter, require('./routes/analyticsRoutes'));
app.use('/login-history',  apiLimiter, require('./routes/loginHistoryRoutes'));

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected ✓');
    await sequelize.sync({ alter: true });
    console.log('Database synced ✓');

    await User.findOrCreate({
      where: { email: 'superadmin@local' },
      defaults: { email: 'superadmin@local', password: 'superadmin123', firstName: 'Super', lastName: 'Admin', role: 'superadmin' }
    });
    await User.findOrCreate({
      where: { email: 'demo@local' },
      defaults: { email: 'demo@local', password: 'password', firstName: 'Demo', lastName: 'User', role: 'user' }
    });
    await User.findOrCreate({
      where: { email: 'admin@local' },
      defaults: { email: 'admin@local', password: 'admin123', firstName: 'Admin', lastName: 'User', role: 'admin' }
    });

    server.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
})();
