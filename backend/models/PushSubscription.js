const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const pushSubscriptionSchema = new Schema({
  userId: { type: String, ref: 'User', required: true },
  endpoint: { type: String, required: true },
  p256dh: { type: String, required: true },
  auth: { type: String, required: true },
});

pushSubscriptionSchema.plugin(idPlugin);

pushSubscriptionSchema.virtual('user', { ref: 'User', localField: 'userId', foreignField: '_id', justOne: true });

module.exports = model('PushSubscription', pushSubscriptionSchema);
