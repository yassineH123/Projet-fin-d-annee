const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const groupMemberSchema = new Schema({
  groupId: { type: String, ref: 'Group', required: true },
  userId:  { type: String, ref: 'User', required: true },
  role:    { type: String, enum: ['member', 'admin'], default: 'member' },
});

groupMemberSchema.plugin(idPlugin);

groupMemberSchema.virtual('user', { ref: 'User', localField: 'userId', foreignField: '_id', justOne: true });
groupMemberSchema.virtual('group', { ref: 'Group', localField: 'groupId', foreignField: '_id', justOne: true });

module.exports = model('GroupMember', groupMemberSchema);
