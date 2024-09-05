const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../../database'); // Adjust the path as needed

const CaseUser = sequelize.define('CaseUser', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    
    
  },
  candidateId: {
    type: DataTypes.STRING,
    allowNull: true, // Adjust if candidateId is required
  },
  isExistingUser:{
    type:DataTypes.BOOLEAN,
    defaultValue:false,
  }
}, {
  timestamps: true, // Creates `createdAt` and `updatedAt` fields
  tableName: 'caseUsers', // Optional: If you want to specify the table name
});

module.exports = CaseUser;
