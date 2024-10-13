const BankDetails = require("../../../Models/PiggyBox/bankDetails");
const Piggybox = require("../../../Models/PiggyBox/piggyBox");
const RequestWithdrawal = require("../../../Models/PiggyBox/requestWithdrawal");
const TransactionHistory = require("../../../Models/PiggyBox/transactionHistory");
const AdminActivity = require("../../../Models/User/adminActivity");
const User = require("../../../Models/User/users");
const sequelize=require('../../../database')
const Sequelize=require('sequelize')


exports.getRequestWithdrawawalInfo = async (req, res, next) => {};

//Status will be passed based no the situation like -> pending /  non pendings
exports.getTopWithdrawalRequestList = async (req, res, next) => {};

//Status and from and to date will be passed....
exports.getCustomDataWithdrawalRequestList = async (req, res, next) => {};

//Get request withdrwal related user information
exports.getCustomerInformation = async (req, res, next) => {};

//Get user withdrwal list
exports.getCustomerWithdrawalRequestList = async (req, res, next) => {};

//Status update -- 
exports.updateCustomerWithdrawalStatus = async (req, res, next) => {};
