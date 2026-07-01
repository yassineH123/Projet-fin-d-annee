const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const reviewSchema = new Schema({
  reviewerId: { type: String, ref: 'User', required: true },
  reviewedId: { type: String, ref: 'User', required: true },
  rideId: { type: String, ref: 'Ride', required: true },
  type: { type: String, enum: ['driver', 'passenger'], required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  punctuality: { type: Number, default: null, min: 1, max: 5 },
  driving: { type: Number, default: null, min: 1, max: 5 },
  communication: { type: Number, default: null, min: 1, max: 5 },
  cleanliness: { type: Number, default: null, min: 1, max: 5 },
  comment: { type: String, default: null },
  response: { type: String, default: null },
});

reviewSchema.plugin(idPlugin);

reviewSchema.virtual('reviewer', { ref: 'User', localField: 'reviewerId', foreignField: '_id', justOne: true });
reviewSchema.virtual('reviewed', { ref: 'User', localField: 'reviewedId', foreignField: '_id', justOne: true });
reviewSchema.virtual('ride', { ref: 'Ride', localField: 'rideId', foreignField: '_id', justOne: true });

module.exports = model('Review', reviewSchema);
