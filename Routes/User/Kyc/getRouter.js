const express = require("express");

const kycPageController = require("../../../Controller/Pages/Kyc/pages");
const { userAuthentication } = require("../../../Middleware/auth");

const router = express.Router();

router.get("/userForm", kycPageController.getKycFormPage);
router.get("/userKycAgreement", kycPageController.getKycAgreementPage);


module.exports = router;
