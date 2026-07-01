const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const promoCodeSchema = new Schema({
  code:        { type: String, maxlength: 20, required: true, unique: true },
  type:        { type: String, enum: ['percent', 'fixed'], required: true },
  value:       { type: Number, required: true },
  maxUses:     { type: Number, default: 100 },
  usedCount:   { type: Number, default: 0 },
  expiresAt:   { type: Date, default: null },
  active:      { type: Boolean, default: true },
  description: { type: String, default: null },
  // NOTE: not present on the original Sequelize model (see models/index.js:
  // `PromoCode.belongsTo(User, { foreignKey: 'userId', as: 'user' })`, which
  // referenced a column this model never actually defined). Added here only
  // so that association has a real field to back it — flagged in migration report.
  userId: { type: String, ref: 'User', default: null },
});

promoCodeSchema.plugin(idPlugin);

promoCodeSchema.virtual('user', { ref: 'User', localField: 'userId', foreignField: '_id', justOne: true });

module.exports = model('PromoCode', promoCodeSchema);
