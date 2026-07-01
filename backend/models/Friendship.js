const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const friendshipSchema = new Schema({
  requesterId: { type: String, ref: 'User', required: true },
  receiverId: { type: String, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'refused', 'blocked'], default: 'pending' },
});

friendshipSchema.plugin(idPlugin);

friendshipSchema.virtual('requester', { ref: 'User', localField: 'requesterId', foreignField: '_id', justOne: true });
friendshipSchema.virtual('receiver', { ref: 'User', localField: 'receiverId', foreignField: '_id', justOne: true });

module.exports = model('Friendship', friendshipSchema);
