const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const ConversationMember = sequelize.define('ConversationMember', {
  id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  conversationId: { type: DataTypes.UUID, allowNull: false },
  userId:         { type: DataTypes.UUID, allowNull: false },
  role:           { type: DataTypes.ENUM('admin', 'member'), defaultValue: 'member' },
}, { tableName: 'conversation_members', timestamps: true });

module.exports = ConversationMember;
