const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const PostSave = sequelize.define('PostSave', {
  id:     { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  postId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
}, { timestamps: true, tableName: 'post_saves', updatedAt: false });

module.exports = PostSave;
