const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const SupportTicket = sequelize.define('SupportTicket', {
  id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:   { type: DataTypes.UUID, allowNull: false },
  subject:  { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.ENUM('bug', 'paiement', 'compte', 'trajet', 'autre'), defaultValue: 'autre' },
  message:  { type: DataTypes.TEXT, allowNull: false },
  status:   { type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'), defaultValue: 'open' },
  adminReply: { type: DataTypes.TEXT, allowNull: true },
  repliedAt:  { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'support_tickets', timestamps: true });

module.exports = SupportTicket;
