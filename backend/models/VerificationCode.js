const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const verificationCodeSchema = new Schema({
  email: { type: String, required: true, maxlength: 160 },
  code: { type: String, required: true, maxlength: 10 },
  expiresAt: { type: Date, required: true },
});

verificationCodeSchema.plugin(idPlugin);

module.exports = model('VerificationCode', verificationCodeSchema);
