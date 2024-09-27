const { DataTypes } = require('sequelize');
const sequelize = require('../../database'); // Adjust the path as needed

const CustomerCase = sequelize.define('CustomerCase', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  caseId: {
    type: DataTypes.STRING, // Change to INTEGER to enable auto-increment
    allowNull: false,
    unique: true, // Ensure uniqueness
    
  },
  creationTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  closeTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isClosedByUser: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isClosedByAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  adminId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Open',
  },
}, {
  timestamps: true, // Creates `createdAt` and `updatedAt` fields
  tableName: 'customerCase', // Optional: If you want to specify the table name
  // Set the starting value for auto-increment
});
// Before creating a new entry, set `caseId` to a custom value starting from 10000000



module.exports = CustomerCase;
