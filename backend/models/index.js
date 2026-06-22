const User = require('./User');
const Ride = require('./Ride');
const Booking = require('./Booking');
const Review = require('./Review');
const Report = require('./Report');
const Conversation = require('./Conversation');
const ConversationMember = require('./ConversationMember');
const Message = require('./Message');
const VerificationCode = require('./VerificationCode');
const Notification = require('./Notification');
const Friendship = require('./Friendship');
const FavoriteRide = require('./FavoriteRide');
const RideAlert = require('./RideAlert');
const PromoCode = require('./PromoCode');
const SupportTicket = require('./SupportTicket');
const EmergencyContact = require('./EmergencyContact');
const Story = require('./Story');
const Group = require('./Group');
const GroupMember = require('./GroupMember');
const Event = require('./Event');
const Premium = require('./Premium');
const WaitlistEntry = require('./WaitlistEntry');
const Transaction = require('./Transaction');
const LoginHistory = require('./LoginHistory');
const AuditLog = require('./AuditLog');
const PushSubscription = require('./PushSubscription');

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

// Reports
Report.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });
Report.belongsTo(User, { foreignKey: 'reportedId', as: 'reported' });
User.hasMany(Report,   { foreignKey: 'reporterId', as: 'sentReports' });
User.hasMany(Report,   { foreignKey: 'reportedId', as: 'receivedReports' });

// Group conversations
Conversation.hasMany(ConversationMember, { foreignKey: 'conversationId', as: 'members' });
ConversationMember.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });
ConversationMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(ConversationMember, { foreignKey: 'userId', as: 'conversationMemberships' });

module.exports = {
  User, Ride, Booking, Review, Report,
  Conversation, ConversationMember, Message, VerificationCode, Notification, Friendship,
  FavoriteRide, RideAlert, PromoCode, SupportTicket, EmergencyContact,
  Story, Group, GroupMember, Event, Premium,
  WaitlistEntry, Transaction, LoginHistory, AuditLog, PushSubscription,
};
