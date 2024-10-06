const Sequelize = require("sequelize");
const sequelize = require("../../database"); // Adjust the path to your database configuration

const User = sequelize.define(
  "User",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    candidateId:{
      type:Sequelize.STRING,
      unique:true,
      allowNull:true,
      defaultValue: 2000000,
      autoIncrement:true,
    },
    byReferallId:{
      type:Sequelize.STRING,
      allowNull:true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
      
    },
    employeeId:{
      type:Sequelize.STRING,
      allowNull:true
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isNumeric: true,
        len: [10, 11], // Adjust based on your requirements
      },
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    tableName: "users", // Optional: specify table name if different from model name
  }
);

module.exports = User;
