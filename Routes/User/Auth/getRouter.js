const express = require("express");

const userAuthenticationController = require("../../../Controller/Pages/UserAuthentication/pages");

const router = express.Router();

router.get("/login", userAuthenticationController.getLoginPage);
router.get("/signUp", userAuthenticationController.getSignUpPage);
router.get('/forgetPassword',userAuthenticationController.getForgetPasswordPage)
router.get('/getCandidateId',userAuthenticationController.getCandidateIdPage)
router.get('/resetPassword',userAuthenticationController.getResetPasswordPage)
router.get('/activateAccount',userAuthenticationController.getActivateAccountPage)
router.get("/otpVerify", userAuthenticationController.getOtpVerifyPage);

module.exports = router;
