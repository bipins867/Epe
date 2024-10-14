const express = require("express");

const referralController=require('../../../../Controller/Admin/PiggyBox/referral')

const router = express.Router();

router.post('/customerList',referralController.getCustomerReferralList)
router.post('/searchedCustomerList',referralController.getSearchedCustomerInformation)
router.post('/customerReferralInfo',referralController.getCustomerReferralInfo)

module.exports = router;
