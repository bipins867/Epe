const express = require("express");

const transactionHistoryController=require('../../../../Controller/Admin/PiggyBox/transactionHistory')

const router = express.Router();


router.post('/transactionHistories',transactionHistoryController.getTopTransactionHistories)
router.post('/customDateTransactionHistories',transactionHistoryController.getCustomDateTransactionHistories)

module.exports = router;
