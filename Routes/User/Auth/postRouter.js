const express = require("express");

const userAuthenticationController = require("../../../Controller/Users/Auth/users");
const {
  checkValidationErrors,
  validateLogin,
  validateSignUp,
  validateChangePassword,
} = require("../../../Middleware/validator");
const {
  middlewareSendOtp,
  middlewareVerifyOtp,
} = require("../../../Middleware/otpAuthentication");
const {
  initialLoginUserAuthentication,
  initialSignuUserAuthentication,
} = require("../../../Middleware/auth");

const router = express.Router();

router.post(
  "/login",
  validateLogin,
  checkValidationErrors,
  initialLoginUserAuthentication,
  middlewareSendOtp,
  middlewareVerifyOtp,
  userAuthenticationController.userLogin
);
router.post(
  "/signUp",
  validateSignUp,
  checkValidationErrors,
  initialSignuUserAuthentication,
  middlewareSendOtp,
  middlewareVerifyOtp,
  userAuthenticationController.userSignUp
);

router.post(
  "/changeUserPassword",

  middlewareSendOtp,
  middlewareVerifyOtp,
  validateChangePassword,
  checkValidationErrors,
  userAuthenticationController.changeUserPassword
);

router.post(
  "/getUserInfo",
  middlewareSendOtp,
  middlewareVerifyOtp,
  userAuthenticationController.getUserInfo
);

router.post("/resendOtp", userAuthenticationController.userResendOtp);

//Here changes are made to upside only ---

router.post(
  "/verifyOtp",
  validateSignUp,
  checkValidationErrors,
  userAuthenticationController.userOtpVerify
);

router.post(
  "/verifyUserResetOrForgetPasswordOtp",
  userAuthenticationController.userResetOrForgetPasswordOtpVerify
);

router.post(
  "/verifyUserForgetCandidateIdOtp",
  userAuthenticationController.userForgetCandidateIdOtpVerify
);
module.exports = router;
