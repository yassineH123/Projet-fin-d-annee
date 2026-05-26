const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const GroupMember = sequelize.define('GroupMember', {
  id:      { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  groupId: { type: DataTypes.UUID, allowNull: false },
  userId:  { type: DataTypes.UUID, allowNull: false },
  role:    { type: DataTypes.ENUM('member','admin'), defaultValue: 'member' },
}, { tableName: 'group_members', timestamps: true });

module.exports = GroupMember;
