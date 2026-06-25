const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const conversationMemberSchema = new Schema({
  conversationId: { type: String, ref: 'Conversation', required: true },
  userId: { type: String, ref: 'User', required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
});

conversationMemberSchema.plugin(idPlugin);

conversationMemberSchema.virtual('conversation', { ref: 'Conversation', localField: 'conversationId', foreignField: '_id', justOne: true });
conversationMemberSchema.virtual('user', { ref: 'User', localField: 'userId', foreignField: '_id', justOne: true });

module.exports = model('ConversationMember', conversationMemberSchema);
