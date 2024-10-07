const express = require("express");

const userAuthenticationController = require("../../../Controller/Users/Auth/users");
const {
  checkValidationErrors,
  validateLogin,
  validateSignUp,
} = require("../../../Middleware/validator");

const router = express.Router();

router.post(
  "/login",
  validateLogin,
  checkValidationErrors,
  userAuthenticationController.userLogin
);
router.post("/signUp", userAuthenticationController.userSignUp);
router.post(
  "/verifyOtp",
  validateSignUp,
  checkValidationErrors,
  userAuthenticationController.userOtpVerify
);

router.post("/resendOtp", userAuthenticationController.userResendOtp);

router.post(
  "/verifyUserResetOrForgetPasswordOtp",
  userAuthenticationController.userResetOrForgetPasswordOtpVerify
);
router.post(
  "/changeUserPassword",
  userAuthenticationController.changeUserPassword
);

router.post("/getUserInfo", userAuthenticationController.getUserInfo);

router.post(
  "/verifyUserForgetCandidateIdOtp",
  userAuthenticationController.userForgetCandidateIdOtpVerify
);
module.exports = router;
