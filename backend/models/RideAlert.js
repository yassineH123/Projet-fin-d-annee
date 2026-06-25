const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const rideAlertSchema = new Schema({
  userId:        { type: String, ref: 'User', required: true },
  from:          { type: String, required: true },
  to:            { type: String, required: true },
  date:          { type: Date, default: null },
  maxPrice:      { type: Number, default: null },
  transportMode: { type: String, default: null },
  active:        { type: Boolean, default: true },
});

rideAlertSchema.plugin(idPlugin);

rideAlertSchema.virtual('user', { ref: 'User', localField: 'userId', foreignField: '_id', justOne: true });

module.exports = model('RideAlert', rideAlertSchema);
