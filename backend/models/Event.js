const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Event = sequelize.define('Event', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  creatorId:   { type: DataTypes.UUID, allowNull: false },
  title:       { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  city:        { type: DataTypes.STRING, allowNull: false },
  address:     { type: DataTypes.STRING, allowNull: true },
  eventDate:   { type: DataTypes.DATE, allowNull: false },
  category:    { type: DataTypes.ENUM('concert','sport','festival','conference','autre'), defaultValue: 'autre' },
  photo:       { type: DataTypes.STRING, allowNull: true },
  attendees:   { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'events', timestamps: true });

module.exports = Event;
