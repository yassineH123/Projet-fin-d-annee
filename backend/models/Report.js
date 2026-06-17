const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reporterId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  reportedUserId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  rideId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  reason: {
    type: DataTypes.ENUM('comportement', 'fraude', 'securite', 'contenu_inapproprie', 'trajet_suspect', 'autre'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'resolved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false,
  },
  adminNote: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  handledBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'reports',
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['reportedUserId'] },
  ],
});

module.exports = Report;
