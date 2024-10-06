const { DataTypes } = require("sequelize");
const sequelize = require('../../database');  // Replace with your actual Sequelize instance

const SavedAddress = sequelize.define(
  "SavedAddress",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    address1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address2: {
      type: DataTypes.STRING,
      allowNull: true, // Allows null values
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pinCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "savedAddresses",
    timestamps: true, // Automatically adds 'createdAt' and 'updatedAt' fields
  }
);

module.exports = SavedAddress;
