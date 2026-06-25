const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const transactionSchema = new Schema({
  userId:      { type: String, ref: 'User', required: true },
  type:        { type: String, enum: ['credit', 'debit'], required: true },
  amount:      { type: Number, required: true },
  description: { type: String, required: true },
  reference:   { type: String, default: null },
  rideId:      { type: String, ref: 'Ride', default: null },
  balanceAfter: { type: Number, required: true },
});

transactionSchema.plugin(idPlugin);

transactionSchema.virtual('user', { ref: 'User', localField: 'userId', foreignField: '_id', justOne: true });

module.exports = model('Transaction', transactionSchema);
