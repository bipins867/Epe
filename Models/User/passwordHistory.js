const { DataTypes } = require('sequelize');
const sequelize = require("../../database");  // Update the path to your Sequelize config

const PasswordHistory = sequelize.define('PasswordHistory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'passwordHistories', // Table name
  timestamps: true, // Enable createdAt and updatedAt fields
});

module.exports = PasswordHistory;
