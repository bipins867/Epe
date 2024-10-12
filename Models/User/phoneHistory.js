const { DataTypes } = require('sequelize');
const sequelize = require("../../database"); // Using the correct path for sequelize

const PhoneHistory = sequelize.define('PhoneHistory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'phoneHistories', // Camel case for table name
  timestamps: true, // Enable createdAt and updatedAt fields
});

module.exports = PhoneHistory;
