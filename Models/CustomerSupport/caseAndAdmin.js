const Sequelize = require("sequelize");
const sequelize = require("../../database");

module.exports = sequelize.define("caseAndAdmin", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  adminId:{
    type:Sequelize.STRING
  },
  customerCaseId:{
    type:Sequelize.STRING
  }

});
