const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const userSchema = new Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  phone:     { type: String, default: null },
  birthDate: { type: Date, default: null },
  avatar:    { type: String, default: null },
  photo:     { type: String, default: null },
  bio:       { type: String, default: null },
  languages:   { type: Schema.Types.Mixed, default: [] },
  preferences: { type: Schema.Types.Mixed, default: { smoking: false, music: true, pets: false, chat: true } },
  avgRating:    { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  totalTrips:   { type: Number, default: 0 },
  isDriver: { type: Boolean, default: false },
  carModel:     { type: String, default: null },
  carColor:     { type: String, default: null },
  carYear:      { type: Number, default: null },
  carPhoto:     { type: String, default: null },
  licensePlate: { type: String, default: null },
  cinDoc:        { type: String, default: null },
  permisDoc:     { type: String, default: null },
  carteGriseDoc: { type: String, default: null },
  passportDoc:   { type: String, default: null },
  nationality: { type: String, enum: ['moroccan', 'foreign'], default: 'moroccan', required: true },
  gender:      { type: String, enum: ['femme', 'homme'], default: null },
  country:     { type: String, maxlength: 100, default: null },
  driverVerified:     { type: Boolean, default: false },
  isHandicapped:      { type: Boolean, default: false },
  handicapAccessible: { type: Boolean, default: false },
  role:   { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user', required: true },
  status: { type: String, enum: ['active', 'suspended', 'blocked'], default: 'active', required: true },
  verified:       { type: Boolean, default: false, required: true },
  onboardingDone: { type: Boolean, default: false, required: true },
  referralCode: { type: String, maxlength: 20, unique: true, sparse: true },
  availabilityStatus: { type: String, enum: ['available', 'busy', 'offline'], default: 'offline' },
  referredBy: { type: String, ref: 'User', default: null },
  referralCredits: { type: Number, default: 0, required: true },
  badges: { type: Schema.Types.Mixed, default: [] },
  walletBalance: { type: Number, default: 0, required: true },
  totalKm:       { type: Number, default: 0, required: true },
  level:    { type: String, enum: ['bronze', 'argent', 'or', 'platine', 'diamant'], default: 'bronze', required: true },
  kycStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none', required: true },
  kycSelfie: { type: String, default: null },
});

userSchema.plugin(idPlugin);

// hasMany virtuals — mirror every Sequelize `as:` alias from the old models/index.js
userSchema.virtual('rides',                 { ref: 'Ride', localField: '_id', foreignField: 'driverId' });
userSchema.virtual('bookings',              { ref: 'Booking', localField: '_id', foreignField: 'passengerId' });
userSchema.virtual('givenReviews',          { ref: 'Review', localField: '_id', foreignField: 'reviewerId' });
userSchema.virtual('receivedReviews',       { ref: 'Review', localField: '_id', foreignField: 'reviewedId' });
userSchema.virtual('conversations1',        { ref: 'Conversation', localField: '_id', foreignField: 'participant1Id' });
userSchema.virtual('conversations2',        { ref: 'Conversation', localField: '_id', foreignField: 'participant2Id' });
userSchema.virtual('notifications',         { ref: 'Notification', localField: '_id', foreignField: 'userId' });
userSchema.virtual('sentRequests',          { ref: 'Friendship', localField: '_id', foreignField: 'requesterId' });
userSchema.virtual('receivedRequests',      { ref: 'Friendship', localField: '_id', foreignField: 'receiverId' });
userSchema.virtual('conversationMemberships', { ref: 'ConversationMember', localField: '_id', foreignField: 'userId' });
userSchema.virtual('filedReports',          { ref: 'Report', localField: '_id', foreignField: 'reporterId' });
userSchema.virtual('receivedReports',       { ref: 'Report', localField: '_id', foreignField: 'reportedUserId' });
userSchema.virtual('adminLogs',             { ref: 'AdminLog', localField: '_id', foreignField: 'adminId' });
userSchema.virtual('savedSearches',         { ref: 'SavedSearch', localField: '_id', foreignField: 'userId' });
userSchema.virtual('favorites',             { ref: 'FavoriteRide', localField: '_id', foreignField: 'userId' });
userSchema.virtual('rideAlerts',            { ref: 'RideAlert', localField: '_id', foreignField: 'userId' });
userSchema.virtual('promoCodes',            { ref: 'PromoCode', localField: '_id', foreignField: 'userId' });
userSchema.virtual('tickets',               { ref: 'SupportTicket', localField: '_id', foreignField: 'userId' });
userSchema.virtual('emergencyContacts',     { ref: 'EmergencyContact', localField: '_id', foreignField: 'userId' });
userSchema.virtual('stories',               { ref: 'Story', localField: '_id', foreignField: 'userId' });
userSchema.virtual('events',                { ref: 'Event', localField: '_id', foreignField: 'creatorId' });
userSchema.virtual('premiums',              { ref: 'Premium', localField: '_id', foreignField: 'userId' });
userSchema.virtual('waitlistEntries',       { ref: 'WaitlistEntry', localField: '_id', foreignField: 'userId' });
userSchema.virtual('transactions',          { ref: 'Transaction', localField: '_id', foreignField: 'userId' });
userSchema.virtual('loginHistory',          { ref: 'LoginHistory', localField: '_id', foreignField: 'userId' });
userSchema.virtual('pushSubscriptions',     { ref: 'PushSubscription', localField: '_id', foreignField: 'userId' });
// Unaliased Sequelize default-name virtuals (Post feed feature) — capitalization
// matters here, see web/src/pages/Feed.jsx (post.User, post.PostComments).
userSchema.virtual('Posts', { ref: 'Post', localField: '_id', foreignField: 'userId' });

module.exports = model('User', userSchema);
