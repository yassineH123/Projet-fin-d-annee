const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const tripSchema = new Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  date: { type: Date, default: null },
  price: { type: String, default: null },
  driver: { type: String, default: null },
  seats: { type: Number, default: null },
});

tripSchema.plugin(idPlugin);

module.exports = model('Trip', tripSchema);
