const { DataTypes } = require('sequelize');
const sequelize = require("../../database"); // Make sure to replace with your actual sequelize instance

const PurchaseHistory = sequelize.define('PurchaseHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Type of the purchase or item',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Detailed description of the purchase',
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
    },
    comment: 'The total amount of the purchase before tax',
  },
  gstAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
    },
    comment: 'The GST applied to the purchase',
  },
}, {
  tableName: 'purchaseHistories', // Specify the table name in the database
  timestamps: true, // Enable createdAt and updatedAt fields
});

module.exports = PurchaseHistory;
