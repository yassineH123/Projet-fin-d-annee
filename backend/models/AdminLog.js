const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const adminLogSchema = new Schema({
  adminId: { type: String, ref: 'User', required: true },
  action: { type: String, required: true, maxlength: 60 },
  targetType: { type: String, required: true, maxlength: 30 },
  targetId: { type: String, default: null },
  details: { type: Schema.Types.Mixed, default: null },
});

adminLogSchema.plugin(idPlugin);
adminLogSchema.set('timestamps', { createdAt: true, updatedAt: false });

adminLogSchema.index({ adminId: 1 });
adminLogSchema.index({ action: 1 });
adminLogSchema.index({ targetType: 1, targetId: 1 });

adminLogSchema.virtual('admin', { ref: 'User', localField: 'adminId', foreignField: '_id', justOne: true });

module.exports = model('AdminLog', adminLogSchema);
