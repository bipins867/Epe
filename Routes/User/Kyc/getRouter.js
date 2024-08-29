const express = require("express");

const kycPageController = require("../../../Controller/Pages/Kyc/pages");
const kycController = require("../../../Controller/Users/Kyc/kyc");
const { userAuthentication } = require("../../../Middleware/auth");

const router = express.Router();

router.get("/userForm", kycPageController.getKycFormPage);
router.get("/userKycAgreement", kycPageController.getKycAgreementPage);
router.get(
  "/userKycAgreementInfo",
  userAuthentication,
  kycController.getUserAgreementInfo
);
router.get(
  "/acceptUserAgreement",
  userAuthentication,
  kycController.acceptUserAgreement
);

module.exports = router;
