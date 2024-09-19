const { DataTypes } = require('sequelize');
const sequelize = require("../../database");
 // Assuming you have set up your database connection here

const ApplyLoan = sequelize.define('ApplyLoan', {
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
  loanType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reasonForLoan: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Admins', // Replace 'Admins' with the actual name of your admin table/model
      key: 'id'
    }
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
  tableName: 'ApplyLoan' // You can customize the table name here
});

module.exports = ApplyLoan;
