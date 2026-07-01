const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const waitlistEntrySchema = new Schema({
  rideId: { type: String, ref: 'Ride', required: true },
  userId: { type: String, ref: 'User', required: true },
  seats:  { type: Number, default: 1 },
  status: { type: String, enum: ['waiting', 'notified', 'converted', 'cancelled'], default: 'waiting' },
});

waitlistEntrySchema.plugin(idPlugin);

waitlistEntrySchema.virtual('user', { ref: 'User', localField: 'userId', foreignField: '_id', justOne: true });
waitlistEntrySchema.virtual('ride', { ref: 'Ride', localField: 'rideId', foreignField: '_id', justOne: true });

module.exports = model('WaitlistEntry', waitlistEntrySchema);
