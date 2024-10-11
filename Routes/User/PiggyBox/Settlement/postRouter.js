const express = require("express");

const settlementController=require('../../../../Controller/Users/PiggyBox/settlement');
const { userInfoVerification } = require("../../../../Middleware/auth");

const router = express.Router();

router.post('/bankDetailsInfo',settlementController.getBankDetails)
router.post('/updateBankDetails',userInfoVerification,settlementController.updateBankDetails)

module.exports = router;
