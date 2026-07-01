const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const postCommentSchema = new Schema({
  userId:  { type: String, ref: 'User', required: true },
  postId:  { type: String, ref: 'Post', required: true },
  content: { type: String, required: true },
});

postCommentSchema.plugin(idPlugin);

// Capitalized to match unaliased Sequelize default-name association — see
// web/src/pages/Feed.jsx (c.User?.firstName for comment authors).
postCommentSchema.virtual('User', { ref: 'User', localField: 'userId', foreignField: '_id', justOne: true });

module.exports = model('PostComment', postCommentSchema);
