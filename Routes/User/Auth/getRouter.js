const express = require("express");

const userAuthenticationController = require("../../../Controller/Pages/UserAuthentication/pages");

const router = express.Router();

router.get("/login", userAuthenticationController.getLoginPage);
router.get("/signUp", userAuthenticationController.getSignUpPage);
router.get("/otpVerify", userAuthenticationController.getOtpVerifyPage);

module.exports = router;
