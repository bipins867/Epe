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
    isDeactivated: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
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
    email: {
      type: Sequelize.STRING,
    },
    name: {
      type: Sequelize.STRING,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    tableName: "admins", // Optional: specify table name if different from model name
  }
);

module.exports = Admin;
