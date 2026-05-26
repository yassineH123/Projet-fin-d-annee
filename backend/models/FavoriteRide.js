const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const FavoriteRide = sequelize.define('FavoriteRide', {
  id:     { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  rideId: { type: DataTypes.UUID, allowNull: false },
}, { tableName: 'favorite_rides', timestamps: true, updatedAt: false });

module.exports = FavoriteRide;
