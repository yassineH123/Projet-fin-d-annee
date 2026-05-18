const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  participant1Id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  participant2Id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  rideId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'conversations',
  timestamps: true,
});

module.exports = Conversation;
