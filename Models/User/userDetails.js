const { DataTypes } = require('sequelize');
const sequelize = require("../../database"); // Make sure to replace with your actual sequelize instance

const UserDetails = sequelize.define('UserDetails', {
  gender: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Gender of the user',
  },
  maritalStatus: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Marital status of the user',
  },
  alternatePhone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isNumeric: true,
      len: [10, 11],
    },
    comment: 'Alternate phone number of the user',
  },
  fatherName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Name of the user\'s father',
  },
  motherName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Name of the user\'s mother',
  },
  spouseName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Name of the user\'s spouse (if applicable)',
  },
  employmentType: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Employment type of the user',
  },
  organizationName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Name of the organization where the user works',
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Job title or role of the user',
  },
  monthlyIncome: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0,
    },
    comment: 'Monthly income of the user',
  },
}, {
  tableName: 'userDetails', // Specify the table name in the database
  timestamps: true, // Enable createdAt and updatedAt fields
});

module.exports = UserDetails;
