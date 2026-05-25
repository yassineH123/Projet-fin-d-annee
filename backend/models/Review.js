const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reviewerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  reviewedId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  rideId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('driver', 'passenger'),
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  punctuality: { type: DataTypes.INTEGER, allowNull: true, validate: { min: 1, max: 5 } },
  driving:     { type: DataTypes.INTEGER, allowNull: true, validate: { min: 1, max: 5 } },
  communication: { type: DataTypes.INTEGER, allowNull: true, validate: { min: 1, max: 5 } },
  cleanliness: { type: DataTypes.INTEGER, allowNull: true, validate: { min: 1, max: 5 } },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'reviews',
});

module.exports = Review;
