const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Transaction = sequelize.define('Transaction', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:      { type: DataTypes.UUID, allowNull: false },
  type:        { type: DataTypes.ENUM('credit', 'debit'), allowNull: false },
  amount:      { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  reference:   { type: DataTypes.STRING, allowNull: true },
  rideId:      { type: DataTypes.UUID, allowNull: true },
  balanceAfter:{ type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, { tableName: 'transactions', timestamps: true });

module.exports = Transaction;
