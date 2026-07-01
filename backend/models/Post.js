const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const postSchema = new Schema({
  userId:     { type: String, ref: 'User', required: true },
  type:       { type: String, enum: ['text', 'trip', 'question'], default: 'text' },
  content:    { type: String, required: true },
  fromCity:   { type: String, default: null },
  toCity:     { type: String, default: null },
  tripDate:   { type: String, default: null },
  price:      { type: Number, default: null },
  seats:      { type: Number, default: null },
  likesCount: { type: Number, default: 0 },
  mediaUrl:   { type: String, default: null },
  mediaType:  { type: String, enum: ['image', 'video'], default: null },
  pinned:     { type: Boolean, default: false },
});

postSchema.plugin(idPlugin);

// Unaliased Sequelize default-name associations (originally set up directly in
// backend/index.js, not models/index.js) — capitalization matters here, see
// web/src/pages/Feed.jsx (post.User?.firstName, post.PostComments?.length/.map).
postSchema.virtual('User', { ref: 'User', localField: 'userId', foreignField: '_id', justOne: true });
postSchema.virtual('PostComments', { ref: 'PostComment', localField: '_id', foreignField: 'postId' });
postSchema.virtual('PostLikes', { ref: 'PostLike', localField: '_id', foreignField: 'postId' });

module.exports = model('Post', postSchema);
