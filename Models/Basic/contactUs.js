const { DataTypes } = require('sequelize');
const sequelize = require("../../database"); // Assuming you have set up your database connection here

const ContactUs = sequelize.define('ContactUs', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reasonForContact: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: true,
   
  },
  adminRemark: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  statusChecked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields automatically
  tableName: 'ContactUs' // You can customize the table name here
});

module.exports = ContactUs;
