const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const emergencyContactSchema = new Schema({
  userId: { type: String, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  relation: { type: String, default: null },
});

emergencyContactSchema.plugin(idPlugin);

emergencyContactSchema.virtual('user', { ref: 'User', localField: 'userId', foreignField: '_id', justOne: true });

module.exports = model('EmergencyContact', emergencyContactSchema);
