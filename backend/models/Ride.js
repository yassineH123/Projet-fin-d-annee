const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const rideSchema = new Schema({
  driverId: { type: String, ref: 'User', required: true },
  from: { type: String, maxlength: 150, required: true },
  to:   { type: String, maxlength: 150, required: true },
  departureDate: { type: Date, required: true },
  price: { type: Number, required: true },
  seats: { type: Number, required: true },
  seatsAvailable: { type: Number, required: true },
  description: { type: String, default: null },
  status: { type: String, enum: ['active', 'cancelled', 'completed'], default: 'active' },
  instantBooking: { type: Boolean, default: false },
  isRecurring: { type: Boolean, default: false },
  recurringDays: { type: Schema.Types.Mixed, default: [] },
  transportMode: { type: String, enum: ['voiture', 'moto', 'minibus', 'van'], default: 'voiture', required: true },
  stops: { type: Schema.Types.Mixed, default: [] },
  distanceKm: { type: Number, default: null },
  womenOnly: { type: Boolean, default: false },
});

rideSchema.plugin(idPlugin);

rideSchema.index({ from: 1, to: 1, departureDate: 1, status: 1 });
rideSchema.index({ driverId: 1 });
rideSchema.index({ status: 1, departureDate: 1 });

rideSchema.virtual('driver', { ref: 'User', localField: 'driverId', foreignField: '_id', justOne: true });
rideSchema.virtual('bookings', { ref: 'Booking', localField: '_id', foreignField: 'rideId' });
rideSchema.virtual('waitlist', { ref: 'WaitlistEntry', localField: '_id', foreignField: 'rideId' });

module.exports = model('Ride', rideSchema);
