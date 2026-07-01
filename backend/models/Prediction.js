const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const predictionSchema = new Schema({
  villeDepart: { type: String, required: true, maxlength: 100 },
  villeArrivee: { type: String, required: true, maxlength: 100 },
  datePrevue: { type: Date, required: true },
  niveau: { type: String, enum: ['fort', 'moyen', 'faible'], required: true },
  raison: { type: String, default: null },
});

predictionSchema.plugin(idPlugin);

module.exports = model('Prediction', predictionSchema);
