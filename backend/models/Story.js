const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const storySchema = new Schema({
  userId:    { type: String, ref: 'User', required: true },
  mediaUrl:  { type: String, required: true },
  mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
  caption:   { type: String, maxlength: 200, default: null },
  expiresAt: { type: Date, required: true },
  views:     { type: Number, default: 0 },
});

storySchema.plugin(idPlugin);

storySchema.virtual('author', { ref: 'User', localField: 'userId', foreignField: '_id', justOne: true });

module.exports = model('Story', storySchema);
