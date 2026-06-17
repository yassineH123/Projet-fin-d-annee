const User = require('./User');
const Ride = require('./Ride');
const Booking = require('./Booking');
const Review = require('./Review');
const Conversation = require('./Conversation');
const ConversationMember = require('./ConversationMember');
const Message = require('./Message');
const VerificationCode = require('./VerificationCode');
const Notification = require('./Notification');
const Friendship = require('./Friendship');
const Report = require('./Report');
const AdminLog = require('./AdminLog');
const SavedSearch = require('./SavedSearch');

// User → Rides (conducteur)
User.hasMany(Ride, { foreignKey: 'driverId', as: 'rides' });
Ride.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });

// Ride → Bookings
Ride.hasMany(Booking, { foreignKey: 'rideId', as: 'bookings' });
Booking.belongsTo(Ride, { foreignKey: 'rideId', as: 'ride' });

// User → Bookings (passager)
User.hasMany(Booking, { foreignKey: 'passengerId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'passengerId', as: 'passenger' });

// Reviews
User.hasMany(Review, { foreignKey: 'reviewerId', as: 'givenReviews' });
User.hasMany(Review, { foreignKey: 'reviewedId', as: 'receivedReviews' });
Review.belongsTo(User, { foreignKey: 'reviewerId', as: 'reviewer' });
Review.belongsTo(User, { foreignKey: 'reviewedId', as: 'reviewed' });
Review.belongsTo(Ride, { foreignKey: 'rideId', as: 'ride' });

// Conversations
User.hasMany(Conversation, { foreignKey: 'participant1Id', as: 'conversations1' });
User.hasMany(Conversation, { foreignKey: 'participant2Id', as: 'conversations2' });
Conversation.belongsTo(User, { foreignKey: 'participant1Id', as: 'participant1' });
Conversation.belongsTo(User, { foreignKey: 'participant2Id', as: 'participant2' });

// Messages
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// Notifications
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Friendships
User.hasMany(Friendship, { foreignKey: 'requesterId', as: 'sentRequests' });
User.hasMany(Friendship, { foreignKey: 'receiverId',  as: 'receivedRequests' });
Friendship.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });
Friendship.belongsTo(User, { foreignKey: 'receiverId',  as: 'receiver' });

// Group conversations
Conversation.hasMany(ConversationMember, { foreignKey: 'conversationId', as: 'members' });
ConversationMember.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });
ConversationMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(ConversationMember, { foreignKey: 'userId', as: 'conversationMemberships' });

// Signalements
User.hasMany(Report, { foreignKey: 'reporterId',      as: 'filedReports' });
User.hasMany(Report, { foreignKey: 'reportedUserId',  as: 'receivedReports' });
Report.belongsTo(User, { foreignKey: 'reporterId',     as: 'reporter' });
Report.belongsTo(User, { foreignKey: 'reportedUserId', as: 'reportedUser' });
Report.belongsTo(User, { foreignKey: 'handledBy',      as: 'handledByAdmin' });
Report.belongsTo(Ride, { foreignKey: 'rideId',         as: 'ride' });

// Journal d'audit admin
User.hasMany(AdminLog, { foreignKey: 'adminId', as: 'adminLogs' });
AdminLog.belongsTo(User, { foreignKey: 'adminId', as: 'admin' });

// Recherches sauvegardées
User.hasMany(SavedSearch, { foreignKey: 'userId', as: 'savedSearches' });
SavedSearch.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { User, Ride, Booking, Review, Conversation, ConversationMember, Message, VerificationCode, Notification, Friendship, Report, AdminLog, SavedSearch };
