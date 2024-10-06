const { DataTypes } = require('sequelize');
const sequelize = require('../../database');  // Make sure to replace with your actual sequelize instance

const ReferredUser = sequelize.define('ReferredUser', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    candidateId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,  // Customize statuses based on your requirements
        allowNull: false,
        defaultValue: 'pending'
    },
    dateOfJoining: {
        type: DataTypes.DATE,
        allowNull: true
    },
    dateOfCompletion: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'referredUsers',
    timestamps: true  // Automatically adds 'createdAt' and 'updatedAt'
});

module.exports = ReferredUser;
