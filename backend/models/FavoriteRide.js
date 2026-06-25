const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const favoriteRideSchema = new Schema({
  userId: { type: String, ref: 'User', required: true },
  rideId: { type: String, ref: 'Ride', required: true },
}, { timestamps: { updatedAt: false } });

favoriteRideSchema.plugin(idPlugin);

favoriteRideSchema.virtual('user', { ref: 'User', localField: 'userId', foreignField: '_id', justOne: true });
favoriteRideSchema.virtual('ride', { ref: 'Ride', localField: 'rideId', foreignField: '_id', justOne: true });

module.exports = model('FavoriteRide', favoriteRideSchema);
