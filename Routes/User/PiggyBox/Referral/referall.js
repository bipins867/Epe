const express = require("express");

const referralController=require('../../../../Controller/Users/PiggyBox/referral');
const { userAuthentication } = require("../../../../Middleware/auth");

const router = express.Router();

router.post('/userReferralInfo',referralController.getUserReferallInfo)
router.post('/referralInfo',userAuthentication,referralController.getReferalInfo)

module.exports = router;
