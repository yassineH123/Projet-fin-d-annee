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
const FavoriteRide     = require('./models/FavoriteRide');
const RideAlert        = require('./models/RideAlert');
const PromoCode        = require('./models/PromoCode');
const SupportTicket    = require('./models/SupportTicket');
const EmergencyContact = require('./models/EmergencyContact');
const Story            = require('./models/Story');
const Group            = require('./models/Group');
const GroupMember      = require('./models/GroupMember');
const Event            = require('./models/Event');
const Premium          = require('./models/Premium');

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

/* ── Associations new models ── */
FavoriteRide.belongsTo(User, { foreignKey: 'userId', as: 'user' });
FavoriteRide.belongsTo(Ride, { foreignKey: 'rideId', as: 'ride' });
User.hasMany(FavoriteRide,   { foreignKey: 'userId', as: 'favorites' });

RideAlert.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(RideAlert,   { foreignKey: 'userId', as: 'rideAlerts' });

SupportTicket.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(SupportTicket,   { foreignKey: 'userId', as: 'tickets' });

EmergencyContact.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(EmergencyContact,   { foreignKey: 'userId', as: 'emergencyContacts' });

Story.belongsTo(User, { foreignKey: 'userId', as: 'author' });
User.hasMany(Story,   { foreignKey: 'userId', as: 'stories' });

Group.belongsTo(User,     { foreignKey: 'creatorId', as: 'creator' });
Group.hasMany(GroupMember,{ foreignKey: 'groupId',   as: 'members' });
GroupMember.belongsTo(User,  { foreignKey: 'userId',  as: 'user' });
GroupMember.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });

Event.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });
User.hasMany(Event,   { foreignKey: 'creatorId', as: 'events' });

Premium.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Premium,   { foreignKey: 'userId', as: 'premiums' });

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
app.use('/favorites',      apiLimiter, require('./routes/favoriteRoutes'));
app.use('/ride-alerts',    apiLimiter, require('./routes/rideAlertRoutes'));
app.use('/promos',         apiLimiter, require('./routes/promoRoutes'));
app.use('/support',        apiLimiter, require('./routes/supportRoutes'));
app.use('/emergency',      apiLimiter, require('./routes/emergencyRoutes'));
app.use('/stories',        apiLimiter, require('./routes/storyRoutes'));
app.use('/groups',         apiLimiter, require('./routes/groupRoutes'));
app.use('/events',         apiLimiter, require('./routes/eventRoutes'));
app.use('/premium',        apiLimiter, require('./routes/premiumRoutes'));
app.use('/export',         apiLimiter, require('./routes/exportRoutes'));

// Route de test email — À SUPPRIMER après vérification
app.get('/test-email', async (req, res) => {
  try {
    const { sendVerificationEmail } = require('./services/emailService');
    await sendVerificationEmail({ to: process.env.SMTP_USER, firstName: 'Adam', code: '123456' });
    res.json({ message: `Email de test envoyé à ${process.env.SMTP_USER}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
