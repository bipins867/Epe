const express = require("express");


const piggyBoxController=require('../../../Controller/Admin/PiggyBox/piggyBox')


const router = express.Router();

router.post('/customerSearch',piggyBoxController.getSearchCustomerResult)
router.post('/customerList',piggyBoxController.getCustomersList)


router.post('/customerInfo',piggyBoxController.getCustomerInformation)
router.post('/transactionHistory',piggyBoxController.getCustomerTopRecentTransactionHistory)
router.post('/addFunds',piggyBoxController.addFundsToCustomerWallet)
router.post('/deductFunds',piggyBoxController.deductFundsFromCustomerWallet)



module.exports = router;
