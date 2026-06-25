const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const bookingSchema = new Schema({
  rideId: { type: String, ref: 'Ride', required: true },
  passengerId: { type: String, ref: 'User', required: true },
  seats: { type: Number, required: true, default: 1 },
  status: { type: String, enum: ['pending', 'accepted', 'refused', 'cancelled'], default: 'pending' },
  message: { type: String, default: null },
  creditsUsed: { type: Number, default: 0, required: true },
});

bookingSchema.plugin(idPlugin);

bookingSchema.virtual('ride', { ref: 'Ride', localField: 'rideId', foreignField: '_id', justOne: true });
bookingSchema.virtual('passenger', { ref: 'User', localField: 'passengerId', foreignField: '_id', justOne: true });

module.exports = model('Booking', bookingSchema);
