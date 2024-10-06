const { DataTypes } = require("sequelize");
const sequelize = require('../../database');  // Make sure to replace with your actual sequelize instance

const BankDetails = sequelize.define(
  "BankDetails",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountHolderName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ifscCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "bankDetails",
    timestamps: true, // Adds 'createdAt' and 'updatedAt' automatically
  }
);

module.exports = BankDetails;
