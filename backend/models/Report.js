const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reporterId: { type: DataTypes.UUID, allowNull: false },
  reportedId:  { type: DataTypes.UUID, allowNull: false },
  rideId:      { type: DataTypes.UUID, allowNull: true },
  reason: {
    type: DataTypes.ENUM(
      'conduite_dangereuse',
      'impolitesse',
      'no_show',
      'escroquerie',
      'harcelement',
      'arnaque_prix',
      'autre'
    ),
    allowNull: false,
  },
  description: { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM('pending', 'reviewed', 'dismissed'),
    defaultValue: 'pending',
  },
}, { tableName: 'reports', timestamps: true });

module.exports = Report;
