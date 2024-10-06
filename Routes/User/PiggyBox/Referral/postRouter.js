const express = require("express");

const referralController=require('../../../../Controller/Users/PiggyBox/referral')

const router = express.Router();

router.post('/referralInfo',referralController.getReferalInfo)

module.exports = router;
