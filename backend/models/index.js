const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const WaitlistEntry = sequelize.define('WaitlistEntry', {
  id:      { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  rideId:  { type: DataTypes.UUID, allowNull: false },
  userId:  { type: DataTypes.UUID, allowNull: false },
  seats:   { type: DataTypes.INTEGER, defaultValue: 1 },
  status:  { type: DataTypes.ENUM('waiting', 'notified', 'converted', 'cancelled'), defaultValue: 'waiting' },
}, { tableName: 'waitlist_entries', timestamps: true });

module.exports = WaitlistEntry;