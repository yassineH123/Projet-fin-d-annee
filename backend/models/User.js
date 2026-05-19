const { DataTypes } = require('sequelize');
<<<<<<< HEAD
const { sequelize } = require('../config/database');
=======
const sequelize = require('../database');
>>>>>>> 3445939 (chore: sync project files for aya)

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
<<<<<<< HEAD
  firstName: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(160),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  photo: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
=======
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  avatar: {
    type: DataTypes.STRING,
>>>>>>> 3445939 (chore: sync project files for aya)
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'superadmin'),
<<<<<<< HEAD
    allowNull: false,
    defaultValue: 'user',
  },
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'blocked'),
    allowNull: false,
    defaultValue: 'active',
  },
  avgRating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  totalRatings: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: { smoking: false, music: true, pets: false, chat: true },
  },
  onboardingDone: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // true pour les comptes existants ; mis à false sur nouveau register
  },
  isDriver: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  carPhoto: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  licensePlate: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
=======
    defaultValue: 'user',
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended'),
    defaultValue: 'active',
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'users',
>>>>>>> 3445939 (chore: sync project files for aya)
});

module.exports = User;
