const User = require('./User');
const Ride = require('./Ride');
const Booking = require('./Booking');
const Review = require('./Review');
const Conversation = require('./Conversation');
const Message = require('./Message');
const VerificationCode = require('./VerificationCode');
const Notification = require('./Notification');

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

module.exports = { User, Ride, Booking, Review, Conversation, Message, VerificationCode, Notification };
