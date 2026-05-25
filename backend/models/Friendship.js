const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Friendship = sequelize.define('Friendship', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  requesterId: { type: DataTypes.UUID, allowNull: false },
  receiverId:  { type: DataTypes.UUID, allowNull: false },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'refused', 'blocked'),
    defaultValue: 'pending',
  },
}, { tableName: 'friendships', timestamps: true });

module.exports = Friendship;
