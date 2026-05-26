const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const LoginHistory = sequelize.define('LoginHistory', {
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:    { type: DataTypes.UUID, allowNull: false },
  ip:        { type: DataTypes.STRING, allowNull: true },
  userAgent: { type: DataTypes.STRING(500), allowNull: true },
  device:    { type: DataTypes.STRING, allowNull: true },
  success:   { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'login_history', timestamps: true, updatedAt: false });

module.exports = LoginHistory;
