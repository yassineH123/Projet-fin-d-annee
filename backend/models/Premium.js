const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Premium = sequelize.define('Premium', {
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:    { type: DataTypes.UUID, allowNull: false },
  plan:      { type: DataTypes.ENUM('monthly','yearly'), allowNull: false },
  price:     { type: DataTypes.DECIMAL(10,2), allowNull: false },
  startDate: { type: DataTypes.DATE, allowNull: false },
  endDate:   { type: DataTypes.DATE, allowNull: false },
  active:    { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'premiums', timestamps: true });

module.exports = Premium;
