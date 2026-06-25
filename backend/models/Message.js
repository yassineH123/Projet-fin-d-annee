const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const messageSchema = new Schema({
  conversationId: { type: String, ref: 'Conversation', required: true },
  senderId: { type: String, ref: 'User', required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  reactions: { type: Schema.Types.Mixed, default: [] },
});

messageSchema.plugin(idPlugin);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, read: 1, senderId: 1 });

messageSchema.virtual('conversation', { ref: 'Conversation', localField: 'conversationId', foreignField: '_id', justOne: true });
messageSchema.virtual('sender', { ref: 'User', localField: 'senderId', foreignField: '_id', justOne: true });

module.exports = model('Message', messageSchema);
