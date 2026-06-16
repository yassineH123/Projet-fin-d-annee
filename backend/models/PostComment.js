const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const User = require('./User');
const Post = require('./Post');

const PostComment = sequelize.define('PostComment', {
  id:      { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:  { type: DataTypes.UUID, allowNull: false, references: { model: User, key: 'id' } },
  postId:  { type: DataTypes.UUID, allowNull: false, references: { model: Post, key: 'id' } },
  content: { type: DataTypes.TEXT, allowNull: false },
}, { timestamps: true, tableName: 'post_comments' });

module.exports = PostComment;