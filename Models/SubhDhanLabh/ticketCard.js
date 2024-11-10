const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../database"); // Make sure to replace with your actual sequelize instance

const TicketCard = sequelize.define(
  "TicketCard",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "ticketCards", // Optional: specify table name
    timestamps: true, // Enable createdAt and updatedAt fields
  }
);

module.exports = TicketCard;
