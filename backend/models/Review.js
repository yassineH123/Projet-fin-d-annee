const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('driver', 'passenger'),
    allowNull: false,
  },
}, {
  tableName: 'reviews',
  timestamps: true,
});

module.exports = Review;
