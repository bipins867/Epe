const Sequelize = require("sequelize");
const sequelize = require("../../database"); // Adjust the path to your database configuration

const Role = sequelize.define(
  "Role",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    roleId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    roleName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    identifier:{
      type:Sequelize.STRING,
      allowNull:false,
      unique:true,
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    tableName: "roles", // Optional: specify table name if different from model name
  }
);

module.exports = Role;
