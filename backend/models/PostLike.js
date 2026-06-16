const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const User = require('./User');
const Post = require('./Post');

const PostLike = sequelize.define('PostLike', {
  id:     { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: User, key: 'id' } },
  postId: { type: DataTypes.UUID, allowNull: false, references: { model: Post, key: 'id' } },
}, { timestamps: true, tableName: 'post_likes' });

module.exports = PostLike;