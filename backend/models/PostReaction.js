const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const PostReaction = sequelize.define('PostReaction', {
  id:     { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  postId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
  emoji:  { type: DataTypes.STRING(10), defaultValue: '❤️' },
}, { timestamps: true, tableName: 'post_reactions', updatedAt: false });

module.exports = PostReaction;
