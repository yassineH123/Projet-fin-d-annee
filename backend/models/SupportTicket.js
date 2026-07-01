const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const supportTicketSchema = new Schema({
  userId: { type: String, ref: 'User', required: true },
  subject: { type: String, required: true },
  category: { type: String, enum: ['bug', 'paiement', 'compte', 'trajet', 'autre'], default: 'autre' },
  message: { type: String, required: true },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  adminReply: { type: String, default: null },
  repliedAt: { type: Date, default: null },
});

supportTicketSchema.plugin(idPlugin);

supportTicketSchema.virtual('user', { ref: 'User', localField: 'userId', foreignField: '_id', justOne: true });

module.exports = model('SupportTicket', supportTicketSchema);
