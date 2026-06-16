const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  type: {
    type: DataTypes.ENUM('booking', 'message', 'review', 'ride', 'system'),
    defaultValue: 'system',
  },
  title:   { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: true },
  link:    { type: DataTypes.STRING, allowNull: true },
  read:    { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'notifications', timestamps: true });

module.exports = Notification;