const { DataTypes } = require('sequelize');
<<<<<<< HEAD
const { sequelize } = require('../config/database');
=======
const sequelize = require('../database');
const User = require('./User');
>>>>>>> 3445939 (chore: sync project files for aya)

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
<<<<<<< HEAD
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
=======
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
>>>>>>> 3445939 (chore: sync project files for aya)
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
<<<<<<< HEAD
    validate: { min: 1, max: 5 },
=======
    validate: { min: 1, max: 5 }
>>>>>>> 3445939 (chore: sync project files for aya)
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
<<<<<<< HEAD
  type: {
    type: DataTypes.ENUM('driver', 'passenger'),
    allowNull: false,
  },
}, {
  tableName: 'reviews',
  timestamps: true,
=======
}, {
  timestamps: true,
  tableName: 'reviews',
>>>>>>> 3445939 (chore: sync project files for aya)
});

module.exports = Review;
