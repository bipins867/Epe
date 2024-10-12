const { DataTypes } = require('sequelize');
const sequelize = require("../../database"); // Using the correct path for sequelize

const EmailHistory = sequelize.define('EmailHistory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'emailHistories', // Camel case for table name
  timestamps: true, // Enable createdAt and updatedAt fields
});

module.exports = EmailHistory;
