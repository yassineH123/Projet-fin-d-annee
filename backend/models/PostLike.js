const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const postLikeSchema = new Schema({
  userId: { type: String, ref: 'User', required: true },
  postId: { type: String, ref: 'Post', required: true },
});

postLikeSchema.plugin(idPlugin);

// Capitalized for consistency with the same unaliased Sequelize default-name
// association pattern used by Post/PostComment (not directly confirmed in
// Feed.jsx, but matches backend/index.js's original `PostLike.belongsTo(User, ...)`
// with no `as:`).
postLikeSchema.virtual('User', { ref: 'User', localField: 'userId', foreignField: '_id', justOne: true });

module.exports = model('PostLike', postLikeSchema);
