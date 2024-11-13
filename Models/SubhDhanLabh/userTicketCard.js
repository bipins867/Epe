const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../database"); // Make sure to replace with your actual sequelize instance
// Replace with your actual sequelize instance

const UserTicketCard = sequelize.define(
  "UserTicketCard",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isTicketActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isFundedFirst: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    rechargeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    completedCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    affiliateBonus: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    goldBonus: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "userTicketCards", // Optional table name
    timestamps: true, // Enable createdAt and updatedAt
  }
);

module.exports = UserTicketCard;
