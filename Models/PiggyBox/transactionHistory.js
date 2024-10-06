const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');  // Make sure to replace with your actual sequelize instance

const TransactionHistory = sequelize.define('TransactionHistory', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        defaultValue: 2000000  // Start the ID from 2000000
    },
    merchantUserId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    merchantTransactionId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    remark: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    credit: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    debit: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    balance: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'transactionHistories',
    timestamps: true  // Automatically adds 'createdAt' and 'updatedAt'
});

module.exports = TransactionHistory;
