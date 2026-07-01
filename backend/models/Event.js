const { Schema, model } = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const eventSchema = new Schema({
  creatorId:   { type: String, ref: 'User', required: true },
  title:       { type: String, required: true },
  description: { type: String, default: null },
  city:        { type: String, required: true },
  address:     { type: String, default: null },
  eventDate:   { type: Date, required: true },
  category:    { type: String, enum: ['concert', 'sport', 'festival', 'conference', 'autre'], default: 'autre' },
  photo:       { type: String, default: null },
  attendees:   { type: Number, default: 0 },
});

eventSchema.plugin(idPlugin);

eventSchema.virtual('creator', { ref: 'User', localField: 'creatorId', foreignField: '_id', justOne: true });

module.exports = model('Event', eventSchema);
