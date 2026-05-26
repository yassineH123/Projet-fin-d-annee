const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
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
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  languages: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: { smoking: false, music: true, pets: false, chat: true },
  },
  avgRating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  totalRatings: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalTrips: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isDriver: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  carModel: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  carColor: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  carYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  carPhoto: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  licensePlate: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cinDoc: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  permisDoc: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  carteGriseDoc: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  passportDoc: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  nationality: {
    type: DataTypes.ENUM('moroccan', 'foreign'),
    defaultValue: 'moroccan',
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  driverVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isHandicapped: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  handicapAccessible: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'superadmin'),
    defaultValue: 'user',
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended'),
    defaultValue: 'active',
    allowNull: false,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  onboardingDone: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  referralCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  availabilityStatus: {
    type: DataTypes.ENUM('available', 'busy', 'offline'),
    defaultValue: 'offline',
  },
  referredBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  referralCredits: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  badges: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  walletBalance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    allowNull: false,
  },
  totalKm: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  level: {
    type: DataTypes.ENUM('bronze', 'argent', 'or', 'platine', 'diamant'),
    defaultValue: 'bronze',
    allowNull: false,
  },
  kycStatus: {
    type: DataTypes.ENUM('none', 'pending', 'approved', 'rejected'),
    defaultValue: 'none',
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'users',
  indexes: [
    { unique: true, fields: ['email'],       name: 'users_email_unique' },
    { unique: true, fields: ['referralCode'], name: 'users_referral_unique' },
  ],
});

module.exports = User;
