const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const PromoCode = sequelize.define('PromoCode', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  code:        { type: DataTypes.STRING(20), allowNull: false, unique: true },
  type:        { type: DataTypes.ENUM('percent', 'fixed'), allowNull: false },
  value:       { type: DataTypes.DECIMAL(10,2), allowNull: false },
  maxUses:     { type: DataTypes.INTEGER, defaultValue: 100 },
  usedCount:   { type: DataTypes.INTEGER, defaultValue: 0 },
  expiresAt:   { type: DataTypes.DATE, allowNull: true },
  active:      { type: DataTypes.BOOLEAN, defaultValue: true },
  description: { type: DataTypes.STRING, allowNull: true },
}, { tableName: 'promo_codes', timestamps: true });

module.exports = PromoCode;
