const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const groupSchema = new Schema({
  name:        { type: String, required: true },
  description: { type: String, default: null },
  from:        { type: String, default: null },
  to:          { type: String, default: null },
  photo:       { type: String, default: null },
  creatorId:   { type: String, ref: 'User', required: true },
  memberCount: { type: Number, default: 1 },
  isPrivate:   { type: Boolean, default: false },
});

groupSchema.plugin(idPlugin);

groupSchema.virtual('creator', { ref: 'User', localField: 'creatorId', foreignField: '_id', justOne: true });
groupSchema.virtual('members', { ref: 'GroupMember', localField: '_id', foreignField: 'groupId' });

module.exports = model('Group', groupSchema);
