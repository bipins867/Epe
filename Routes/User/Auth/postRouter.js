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

router.post('/resendOtp',userAuthenticationController.userResendOtp)

module.exports = router;
