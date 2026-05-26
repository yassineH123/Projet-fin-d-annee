const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const EmergencyContact = sequelize.define('EmergencyContact', {
  id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:   { type: DataTypes.UUID, allowNull: false },
  name:     { type: DataTypes.STRING, allowNull: false },
  phone:    { type: DataTypes.STRING, allowNull: false },
  relation: { type: DataTypes.STRING, allowNull: true },
}, { tableName: 'emergency_contacts', timestamps: true });

module.exports = EmergencyContact;
