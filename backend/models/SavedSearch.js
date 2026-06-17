const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const SavedSearch = sequelize.define('SavedSearch', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  fromCity: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  toCity: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
}, {
  tableName: 'saved_searches',
  timestamps: true,
  updatedAt: false,
  indexes: [{ fields: ['userId'] }],
});

module.exports = SavedSearch;
