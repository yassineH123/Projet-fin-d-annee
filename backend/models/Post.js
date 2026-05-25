const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const User = require('./User');

const Post = sequelize.define('Post', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:     { type: DataTypes.UUID, allowNull: false, references: { model: User, key: 'id' } },
  type:       { type: DataTypes.ENUM('text', 'trip', 'question'), defaultValue: 'text' },
  content:    { type: DataTypes.TEXT, allowNull: false },
  fromCity:   { type: DataTypes.STRING },
  toCity:     { type: DataTypes.STRING },
  tripDate:   { type: DataTypes.STRING },
  price:      { type: DataTypes.INTEGER },
  seats:      { type: DataTypes.INTEGER },
  likesCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  mediaUrl:   { type: DataTypes.STRING, allowNull: true },
  mediaType:  { type: DataTypes.ENUM('image', 'video'), allowNull: true },
  pinned:     { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true, tableName: 'posts' });

module.exports = Post;
