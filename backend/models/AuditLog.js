const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const AuditLog = sequelize.define('AuditLog', {
  id:      { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:  { type: DataTypes.UUID, allowNull: true },
  action:  { type: DataTypes.STRING, allowNull: false },
  target:  { type: DataTypes.STRING, allowNull: true },
  details: { type: DataTypes.JSON,   allowNull: true },
  ip:      { type: DataTypes.STRING, allowNull: true },
}, { tableName: 'audit_logs', timestamps: true, updatedAt: false });

module.exports = AuditLog;
