// Chaque modèle Mongoose définit ses propres champs ET ses "virtuals" (l'équivalent
// des associations Sequelize aliasées) directement dans son propre fichier — voir
// par ex. models/Ride.js (`rideSchema.virtual('driver', ...)`). Ce fichier ne fait
// plus que ré-exporter chaque modèle pour que `require('../models')` continue de
// fonctionner partout sans changement.
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
const Prediction = require('./Prediction');
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
const PushSubscription = require('./PushSubscription');
const AuditLog = require('./AuditLog');
const Post = require('./Post');
const PostComment = require('./PostComment');
const PostLike = require('./PostLike');
const PostReaction = require('./PostReaction');
const PostSave = require('./PostSave');

module.exports = {
  User, Ride, Booking, Review, Conversation, ConversationMember, Message, VerificationCode,
  Notification, Friendship, Report, AdminLog, SavedSearch, Prediction,
  FavoriteRide, RideAlert, PromoCode, SupportTicket, EmergencyContact,
  Story, Group, GroupMember, Event, Premium,
  WaitlistEntry, Transaction, LoginHistory, PushSubscription,
  AuditLog, Post, PostComment, PostLike, PostReaction, PostSave,
};
