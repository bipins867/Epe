const express = require("express");

const requestWithdrawalController=require('../../../../Controller/Users/PiggyBox/requestWithdrawal')

const router = express.Router();

router.post('/withdrawalInfo',requestWithdrawalController.requestWithdrawalInfo)
router.post('/addWithdrawalRequest',requestWithdrawalController.requestForWithdrawal)

module.exports = router;
