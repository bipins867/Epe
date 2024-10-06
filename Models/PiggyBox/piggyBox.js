const { DataTypes } = require('sequelize');
const sequelize = require('../../database');   // Make sure to replace with your actual sequelize instance

const Piggybox = sequelize.define('Piggybox', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    piggyBalance: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    interestBalance: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    isFundedFirst: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'piggyboxes',
    timestamps: true  // Automatically adds 'createdAt' and 'updatedAt'
});

module.exports = Piggybox;
