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
    adminId:{
      type:Sequelize.STRING,
      allowNull:true,
    },
    adminRemark:{
      type:Sequelize.STRING,
      allowNull:true
    },
    isBlocked: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    isRequestedClouser: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    isByReferralUsed: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    candidateId: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: true,
    },
    byReferallId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    employeeId: {
      type: Sequelize.STRING,
      allowNull: true,
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
