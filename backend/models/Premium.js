const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const premiumSchema = new Schema({
  userId:    { type: String, ref: 'User', required: true },
  plan:      { type: String, enum: ['monthly', 'yearly'], required: true },
  price:     { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate:   { type: Date, required: true },
  active:    { type: Boolean, default: true },
});

premiumSchema.plugin(idPlugin);

premiumSchema.virtual('user', { ref: 'User', localField: 'userId', foreignField: '_id', justOne: true });

module.exports = model('Premium', premiumSchema);
