const Sequelize = require('sequelize');
const sequelize = require('../../database'); // Adjust the path to your database configuration

const UserKyc = sequelize.define('UserKyc', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  dob: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },
  status:{
    type:Sequelize.STRING,
    allowNull:false,
    default:"Pending"
  },
  userUrl: {
    type: Sequelize.STRING,
    allowNull: true, // Set to true if the image URL is optional
  },
  aadharNumber: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [12, 12], // Assuming Aadhar card number is 12 digits
    },
  },
  aadharFrontUrl: {
    type: Sequelize.STRING,
    allowNull: true, // Set to true if the URL is optional
  },
  aadharBackUrl: {
    type: Sequelize.STRING,
    allowNull: true, // Set to true if the URL is optional
  },
  panNumber: {
    type: Sequelize.STRING, 
    allowNull: false,
    unique: true,
    validate: {
      len: [10, 10], // Assuming PAN number is 10 characters
    },
  },
  panUrl: {
    type: Sequelize.STRING,
    allowNull: true, // Set to true if the URL is optional
  },
  adminMessage:{
    type:Sequelize.STRING
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
  tableName: 'userkycs', // Optional: specify table name if different from model name
});

module.exports = UserKyc;
