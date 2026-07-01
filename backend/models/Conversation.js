const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const conversationSchema = new Schema({
  participant1Id: { type: String, ref: 'User', required: true },
  participant2Id: { type: String, ref: 'User', required: true },
  rideId: { type: String, ref: 'Ride', default: null },
  lastMessageAt: { type: Date, default: null },
  type: { type: String, enum: ['direct', 'group'], default: 'direct' },
  name: { type: String, default: null },
});

conversationSchema.plugin(idPlugin);

conversationSchema.virtual('participant1', { ref: 'User', localField: 'participant1Id', foreignField: '_id', justOne: true });
conversationSchema.virtual('participant2', { ref: 'User', localField: 'participant2Id', foreignField: '_id', justOne: true });
conversationSchema.virtual('messages', { ref: 'Message', localField: '_id', foreignField: 'conversationId' });
conversationSchema.virtual('members', { ref: 'ConversationMember', localField: '_id', foreignField: 'conversationId' });

module.exports = model('Conversation', conversationSchema);
