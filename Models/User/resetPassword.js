const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');  // Make sure to replace with your actual sequelize instance

const ResetPassword = sequelize.define('ResetPassword', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    resetId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    status: {
        type: DataTypes.STRING,  // Customize statuses as needed
        allowNull: false,
        defaultValue: 'pending'
    },
    creationTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW  // Automatically sets the current date and time
    }
}, {
    tableName: 'resetPasswords',
    timestamps: false  // We only have creationTime, so no need for Sequelize timestamps
});

module.exports = ResetPassword;
