const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Group = sequelize.define('Group', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:        { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  from:        { type: DataTypes.STRING, allowNull: true },
  to:          { type: DataTypes.STRING, allowNull: true },
  photo:       { type: DataTypes.STRING, allowNull: true },
  creatorId:   { type: DataTypes.UUID, allowNull: false },
  memberCount: { type: DataTypes.INTEGER, defaultValue: 1 },
  isPrivate:   { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'groups', timestamps: true });

module.exports = Group;
