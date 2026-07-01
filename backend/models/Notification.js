const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const notificationSchema = new Schema({
  userId: { type: String, ref: 'User', required: true },
  type: { type: String, enum: ['booking', 'message', 'review', 'ride', 'system'], default: 'system' },
  title: { type: String, required: true },
  message: { type: String, default: null },
  link: { type: String, default: null },
  read: { type: Boolean, default: false },
});

notificationSchema.plugin(idPlugin);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

notificationSchema.virtual('user', { ref: 'User', localField: 'userId', foreignField: '_id', justOne: true });

module.exports = model('Notification', notificationSchema);
