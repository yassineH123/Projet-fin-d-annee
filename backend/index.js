require('dotenv').config();
const http    = require('http');
const express = require('express');
const cors    = require('cors');
const sequelize = require('./database');
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

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth',          require('./routes/authRoutes'));
app.use('/users',         require('./routes/userRoutes'));
app.use('/uploads',       require('express').static(require('path').join(__dirname, 'uploads')));
app.use('/trips',         require('./routes/trips')());
app.use('/privacy',       require('./routes/privacy')());
app.use('/admin',         require('./routes/adminRoutes'));
app.use('/superadmin',    require('./routes/superadmin')());
app.use('/posts',         require('./routes/postRoutes'));
app.use('/notifications', require('./routes/notificationRoutes'));
app.use('/friends',       require('./routes/friendRoutes'));
app.use('/messages',      require('./routes/messageRoutes'));
app.use('/bookings',      require('./routes/bookingRoutes'));
app.use('/rides',         require('./routes/rideRoutes'));
app.use('/reviews',       require('./routes/reviewRoutes'));

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
