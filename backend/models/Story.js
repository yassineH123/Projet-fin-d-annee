const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Story = sequelize.define('Story', {
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:    { type: DataTypes.UUID, allowNull: false },
  mediaUrl:  { type: DataTypes.STRING, allowNull: false },
  mediaType: { type: DataTypes.ENUM('image','video'), defaultValue: 'image' },
  caption:   { type: DataTypes.STRING(200), allowNull: true },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  views:     { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'stories', timestamps: true });

module.exports = Story;
