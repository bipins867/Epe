const express = require("express");

const customerController=require('../../../../Controller/Admin/PiggyBox/customer')

const router = express.Router();

router.post('/customerSearch',customerController.getSearchCustomerResult)
router.post('/customerList',customerController.getCustomersList)
router.post('/customerInfo',customerController.getCustomerInformation)

router.post('/updateCustomer',customerController.updateCustomerInformation)
router.post('/blockedStatus',customerController.updateBlockedStatus)

module.exports = router;
