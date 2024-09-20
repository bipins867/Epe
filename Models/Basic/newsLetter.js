const { DataTypes } = require('sequelize');
const sequelize = require("../../database");
 // Assuming you have set up your database connection here

 const Newsletter = sequelize.define('NewsLetter', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    isSubscribed: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true,
    tableName: 'NewsLetter' // to keep track of createdAt and updatedAt
  });
  
  module.exports = Newsletter;