const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const savedSearchSchema = new Schema({
  userId: { type: String, ref: 'User', required: true },
  fromCity: { type: String, required: true, maxlength: 100 },
  toCity: { type: String, required: true, maxlength: 100 },
});

savedSearchSchema.plugin(idPlugin);

savedSearchSchema.index({ userId: 1 });

savedSearchSchema.virtual('user', { ref: 'User', localField: 'userId', foreignField: '_id', justOne: true });

module.exports = model('SavedSearch', savedSearchSchema);
