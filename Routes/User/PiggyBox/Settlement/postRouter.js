const express = require("express");

const settlementController=require('../../../../Controller/Users/PiggyBox/settlement')

const router = express.Router();

router.post('/bankDetailsInfo',settlementController.getBankDetails)
router.post('/updateBankDetails',settlementController.updateBankDetails)

module.exports = router;
