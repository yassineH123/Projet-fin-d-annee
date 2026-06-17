const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const AdminLog = sequelize.define('AdminLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  adminId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING(60),
    allowNull: false,
  },
  targetType: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  targetId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'admin_logs',
  timestamps: true,
  updatedAt: false,
  indexes: [
    { fields: ['adminId'] },
    { fields: ['action'] },
    { fields: ['targetType', 'targetId'] },
  ],
});

module.exports = AdminLog;
