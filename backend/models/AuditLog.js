const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const auditLogSchema = new Schema({
  userId: { type: String, ref: 'User', default: null },
  action: { type: String, required: true },
  target: { type: String, default: null },
  details: { type: Schema.Types.Mixed, default: null },
  ip: { type: String, default: null },
});

auditLogSchema.plugin(idPlugin);
auditLogSchema.set('timestamps', { createdAt: true, updatedAt: false });

module.exports = model('AuditLog', auditLogSchema);
