const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const VerificationCode = sequelize.define(
  'VerificationCode',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(160),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'verification_codes',
    timestamps: false,
  }
);

module.exports = VerificationCode;