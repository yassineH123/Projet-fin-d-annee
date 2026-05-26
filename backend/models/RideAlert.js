const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const RideAlert = sequelize.define('RideAlert', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:       { type: DataTypes.UUID, allowNull: false },
  from:         { type: DataTypes.STRING, allowNull: false },
  to:           { type: DataTypes.STRING, allowNull: false },
  date:         { type: DataTypes.DATEONLY, allowNull: true },
  maxPrice:     { type: DataTypes.DECIMAL(10,2), allowNull: true },
  transportMode:{ type: DataTypes.STRING, allowNull: true },
  active:       { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'ride_alerts', timestamps: true });

module.exports = RideAlert;
