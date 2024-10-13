const BankDetails = require("../../../Models/PiggyBox/bankDetails");
const Piggybox = require("../../../Models/PiggyBox/piggyBox");
const RequestWithdrawal = require("../../../Models/PiggyBox/requestWithdrawal");
const TransactionHistory = require("../../../Models/PiggyBox/transactionHistory");
const AdminActivity = require("../../../Models/User/adminActivity");
const User = require("../../../Models/User/users");
const sequelize=require('../../../database')
const Sequelize=require('sequelize')


exports.getPendingClosoureRequestList=async(req,res,next)=>{}

exports.getHistoryOfClouserRequestList=async(req,res,next)=>{}

exports.getCustomerInformation=async(req,res,next)=>{}

exports.approveCustomerClouserRequest=async(req,res,next)=>{}

exports.recejectCustomerClouserRequest=async(req,res,next)=>{}