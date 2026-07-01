const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const postSaveSchema = new Schema({
  postId: { type: String, ref: 'Post', required: true },
  userId: { type: String, ref: 'User', required: true },
});

postSaveSchema.plugin(idPlugin);

postSaveSchema.virtual('user', { ref: 'User', localField: 'userId', foreignField: '_id', justOne: true });
postSaveSchema.virtual('post', { ref: 'Post', localField: 'postId', foreignField: '_id', justOne: true });

module.exports = model('PostSave', postSaveSchema);
