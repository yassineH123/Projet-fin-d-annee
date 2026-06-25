const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const postReactionSchema = new Schema({
  postId: { type: String, ref: 'Post', required: true },
  userId: { type: String, ref: 'User', required: true },
  emoji:  { type: String, maxlength: 10, default: '❤️' },
});

postReactionSchema.plugin(idPlugin);

postReactionSchema.virtual('user', { ref: 'User', localField: 'userId', foreignField: '_id', justOne: true });
postReactionSchema.virtual('post', { ref: 'Post', localField: 'postId', foreignField: '_id', justOne: true });

module.exports = model('PostReaction', postReactionSchema);
