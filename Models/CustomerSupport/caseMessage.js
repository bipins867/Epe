const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../../database'); // Adjust the path as needed

const CaseMessage = sequelize.define('CaseMessage', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  adminId:{
    type:DataTypes.STRING,
    allowNull:true,
  },
  isFile: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  messageType:{
    type:DataTypes.STRING,
    allowNull:true
  },
  isAdminSend: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  creationTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  seenByAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  seenByUser: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true, // Creates `createdAt` and `updatedAt` fields
  tableName: 'caseMessages', // Optional: If you want to specify the table name
});

module.exports = CaseMessage;
