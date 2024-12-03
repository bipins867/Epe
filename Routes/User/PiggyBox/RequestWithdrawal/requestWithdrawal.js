const express = require("express");

const requestWithdrawalController=require('../../../../Controller/Users/PiggyBox/requestWithdrawal');
const { userInfoVerification } = require("../../../../Middleware/auth");

const router = express.Router();

router.post('/withdrawalInfo',requestWithdrawalController.requestWithdrawalInfo)
router.post('/addWithdrawalRequest',userInfoVerification,requestWithdrawalController.requestForWithdrawal)
router.post('/cancelWithdrawalRequest',userInfoVerification,requestWithdrawalController.requestForCancelWithdrawal)
module.exports = router;
