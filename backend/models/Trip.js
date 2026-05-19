const { DataTypes } = require('sequelize');
<<<<<<< HEAD
const { sequelize } = require('../config/database');
=======
const sequelize = require('../database');
>>>>>>> 3445939 (chore: sync project files for aya)

const Trip = sequelize.define('Trip', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  from: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  to: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  price: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  driver: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  seats: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'trips',
});

module.exports = Trip;
