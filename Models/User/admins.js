const Sequelize = require("sequelize");
const sequelize = require("../../database"); // Adjust the path to your database configuration

const Admin = sequelize.define(
  "Admin",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    adminType: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    freezeStatus: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    tableName: "admins", // Optional: specify table name if different from model name
  }
);

module.exports = Admin;
