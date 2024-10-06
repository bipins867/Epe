const { DataTypes } = require('sequelize');
const sequelize = require('../../database');  // Make sure to replace with your actual sequelize instance

const Referrals = sequelize.define('Referrals', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    referralId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    noOfReferrals: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0  // Default to 0 if no referrals yet
    },
    pendingReferrals: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0  // Default to 0 if no pending referrals
    }
}, {
    tableName: 'referrals',
    timestamps: true  // Automatically adds 'createdAt' and 'updatedAt'
});

module.exports = Referrals;
