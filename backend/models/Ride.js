const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Ride = sequelize.define('Ride', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  driverId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  from: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  to: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  departureDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  seats: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  seatsAvailable: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'cancelled', 'completed'),
    defaultValue: 'active',
  },
  instantBooking: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  recurringDays: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
}, {
  tableName: 'rides',
  timestamps: true,
});

module.exports = Ride;
