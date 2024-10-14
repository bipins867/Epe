const {
  otpStore,
  sendOtpAccountVerifyMessage,
  sendLoginOtpMessage,
  sendSignUpOtpMessage,
} = require("../Utils/MailService");
const crypto = require("crypto");
//const { sendOtpToPhone } = require("../Utils/utils");
const jwt = require("jsonwebtoken");

exports.middlewareSendOtp = async (req, res, next) => {
  try {
    const { otpAuthenticationToken, otpType, apiUrl } = req.body;

    if (otpAuthenticationToken) {
      next();
    }
    //Checking for authenticated user
    else {
      let phone;
      if (req.user) {
        phone = req.user.phone;
      } else {
        phone = req.body.phone;

        if (!phone) {
          return res
            .status(404)
            .json({ message: "User Mobile Number  is Invalid!" });
        }
      }

      const phoneOtp = crypto.randomInt(100000, 999999).toString();

      otpStore[phone] = { phoneOtp };

      setTimeout(() => {
        delete otpStore[phone];
      }, 5 * 60 * 1000);
      console.log(otpStore);

      if (otpType === "forgetCandidateId" ||otpType === "resetPassword" ) {
        sendOtpAccountVerifyMessage(phone, phoneOtp);
      } else if (otpType === "login") {
        sendLoginOtpMessage(phone, phoneOtp);
      } else if (otpType === "signUp") {
        sendSignUpOtpMessage(phone, phoneOtp);
      } else {
        return res.status(404).json({ message: "Invalid Otp Type!" });
      }

      const token = jwt.sign(
        { ...req.body, phone },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "5m",
        }
      );

      res.status(200).send({
        message: "OTP sent successfully.",
        otpAuthenticationToken: token,
        otpType: otpType,
        apiUrl,
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};

exports.middlewareVerifyOtp = (req, res, next) => {
  try {
    const { otpAuthenticationToken, userPhoneOtp } = req.body;

    if (otpAuthenticationToken) {
      try {
        const payload = jwt.verify(
          otpAuthenticationToken,
          process.env.JWT_SECRET_KEY
        );

        const { phone } = payload;

        const otpKey = phone;

        if (!otpStore[otpKey]) {
          // await transaction.rollback(); // Rollback transaction
          return res.status(400).send({ message: "OTP expired or invalid." });
        }

        const { phoneOtp } = otpStore[otpKey];

        // Validate OTP
        if (`${userPhoneOtp}` != `${phoneOtp}`) {
          // await transaction.rollback(); // Rollback transaction
          return res.status(400).send({ message: "Invalid OTP." });
        }
        //console.log(payload);
        req.payload = payload;
        return next();
      } catch (err) {
        return res.status(503).json({ error: "Invalid Signature!" });
      }
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};
