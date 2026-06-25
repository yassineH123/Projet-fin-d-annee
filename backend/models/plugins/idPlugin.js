const { randomUUID } = require('crypto');

// Mirrors Sequelize's UUID-string primary keys + default JSON shape ({ id, ...,
// no __v }) so every existing API response shape and JWT payload keeps working
// unchanged after the Mongoose migration.
module.exports = function idPlugin(schema) {
  schema.add({ _id: { type: String, default: randomUUID } });

  schema.set('timestamps', true);
  schema.set('toJSON', { virtuals: true });
  schema.set('toObject', { virtuals: true });

  function transform(_doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }

  schema.options.toJSON.transform = transform;
  schema.options.toObject.transform = transform;
};
