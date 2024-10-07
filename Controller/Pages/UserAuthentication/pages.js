const path = require("path");

exports.getLoginPage = async (req, res, next) => {
  res.sendFile(path.resolve("views", "UserAuthentication", "login.html"));
};

exports.getSignUpPage = async (req, res, next) => {
  res.sendFile(path.resolve("views", "UserAuthentication", "signUp.html"));
};

exports.getForgetPasswordPage = async (req, res, next) => {
  res.sendFile(
    path.resolve("views", "UserAuthentication", "forgetPassword.html")
  );
};
exports.getCandidateIdPage = async (req, res, next) => {
    res.sendFile(
      path.resolve("views", "UserAuthentication", "getCandidateId.html")
    );
  };
  exports.getResetPasswordPage = async (req, res, next) => {
    res.sendFile(
      path.resolve("views", "UserAuthentication", "resetPassword.html")
    );
  };

exports.getOtpVerifyPage = async (req, res, next) => {
  res.sendFile(path.resolve("views", "UserAuthentication", "otpVerify.html"));
};
