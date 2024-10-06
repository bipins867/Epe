const { DataTypes } = require("sequelize");
const sequelize = require('../../database');  // Make sure to replace with your actual sequelize instance

const RequestWithdrawal = sequelize.define(
  "RequestWithdrawal",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    requestId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    requestDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    candidateId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    userRemark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },
    adminId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    adminRemark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "requestWithdrawals",
    timestamps: true, // This will automatically add 'createdAt' and 'updatedAt' fields
  }
);

module.exports = RequestWithdrawal;
