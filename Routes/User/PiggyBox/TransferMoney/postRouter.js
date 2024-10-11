const express = require("express");

const transferMoneyController=require('../../../../Controller/Users/PiggyBox/transferMoney');
const { userInfoVerification } = require("../../../../Middleware/auth");


const router = express.Router();


router.post('/getTransferInfo',transferMoneyController.getTransferInfo)
router.post('/getTransferUserInfo',transferMoneyController.getTransferUserInfo)
router.post('/getTransactionHistoryWithDate',transferMoneyController.getTransactionHistoryWithDate)
router.post('/getTopTransactionHistory',transferMoneyController.getTopTransactions)
router.post('/transferMoney',userInfoVerification,transferMoneyController.transferMoney)

module.exports = router;
