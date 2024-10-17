const express = require("express");

const userAuthenticationController = require("../../../Controller/Users/Auth/users");
const userActivityController = require("../../../Controller/Users/Auth/userActivity");

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
  initialForgetCustomerIdUserAuthentication,
  initialResetPasswordUserAuthentication,
  userAuthentication,
} = require("../../../Middleware/auth");
const {
  userLoginLimiter,
  userSignUpLimiter,
  userAuthLimiter,
  userResendOtpimiter,
} = require("../../../Middleware/rateLimiter");

const router = express.Router();

router.post(
  "/login",
  userLoginLimiter,
  initialLoginUserAuthentication,
  middlewareSendOtp,
  middlewareVerifyOtp,
  userAuthenticationController.userLogin
);
router.post(
  "/signUp",
  userSignUpLimiter,
  validateSignUp,
  checkValidationErrors,
  initialSignuUserAuthentication,
  middlewareSendOtp,
  middlewareVerifyOtp,
  userAuthenticationController.userSignUp
);

router.post(
  "/changeUserPassword",
  userAuthLimiter,
  initialResetPasswordUserAuthentication,
  middlewareSendOtp,
  middlewareVerifyOtp,
  validateChangePassword,
  checkValidationErrors,
  userAuthenticationController.changeUserPassword
);

router.post(
  "/getUserInfo",
  userAuthLimiter,
  initialForgetCustomerIdUserAuthentication,
  middlewareSendOtp,
  middlewareVerifyOtp,
  userAuthenticationController.getUserInfo
);

router.post(
  "/activateAccount",
  userAuthLimiter,
  middlewareSendOtp,
  middlewareVerifyOtp,
  userAuthenticationController.activateUserAccount
);

router.post(
  "/getUserActivity",
  userAuthentication,
  userActivityController.getUserActivityHistory
);

router.post("/resendOtp",userResendOtpimiter, userAuthenticationController.userResendOtp);

//Here changes are made to upside only ---

// router.post(
//   "/verifyOtp",
//   validateSignUp,
//   checkValidationErrors,
//   userAuthenticationController.userOtpVerify
// );

// router.post(
//   "/verifyUserResetOrForgetPasswordOtp",
//   userAuthenticationController.userResetOrForgetPasswordOtpVerify
// );

// router.post(
//   "/verifyUserForgetCandidateIdOtp",
//   userAuthenticationController.userForgetCandidateIdOtpVerify
// );

module.exports = router;
