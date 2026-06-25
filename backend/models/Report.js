const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const reportSchema = new Schema({
  reporterId: { type: String, ref: 'User', required: true },
  reportedUserId: { type: String, ref: 'User', required: true },
  rideId: { type: String, ref: 'Ride', default: null },
  reason: {
    type: String,
    enum: [
      'comportement', 'fraude', 'securite', 'contenu_inapproprie', 'trajet_suspect', 'autre',
      'conduite_dangereuse', 'impolitesse', 'no_show', 'escroquerie', 'arnaque_prix', 'harcelement',
    ],
    required: true,
  },
  description: { type: String, default: null },
  status: { type: String, enum: ['pending', 'in_progress', 'resolved', 'rejected'], default: 'pending', required: true },
  adminNote: { type: String, default: null },
  handledBy: { type: String, ref: 'User', default: null },
  resolvedAt: { type: Date, default: null },
});

reportSchema.plugin(idPlugin);

reportSchema.index({ status: 1 });
reportSchema.index({ reportedUserId: 1 });

reportSchema.virtual('reporter', { ref: 'User', localField: 'reporterId', foreignField: '_id', justOne: true });
reportSchema.virtual('reportedUser', { ref: 'User', localField: 'reportedUserId', foreignField: '_id', justOne: true });
reportSchema.virtual('handledByAdmin', { ref: 'User', localField: 'handledBy', foreignField: '_id', justOne: true });
reportSchema.virtual('ride', { ref: 'Ride', localField: 'rideId', foreignField: '_id', justOne: true });

module.exports = model('Report', reportSchema);
