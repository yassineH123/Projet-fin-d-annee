const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const loginHistorySchema = new Schema({
  userId: { type: String, ref: 'User', required: true },
  ip: { type: String, default: null },
  userAgent: { type: String, maxlength: 500, default: null },
  device: { type: String, default: null },
  success: { type: Boolean, default: true },
});

loginHistorySchema.plugin(idPlugin);
loginHistorySchema.set('timestamps', { createdAt: true, updatedAt: false });

loginHistorySchema.virtual('user', { ref: 'User', localField: 'userId', foreignField: '_id', justOne: true });

module.exports = model('LoginHistory', loginHistorySchema);
