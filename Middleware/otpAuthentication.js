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

      otpStore[phone] = { otp:phoneOtp,count:3 };

      setTimeout(() => {
        delete otpStore[phone];
      }, 5 * 60 * 1000);

      if (process.env.NODE_ENV === "testing") {
        console.log(otpStore);
      }

      if (otpType === "forgetCandidateId" || otpType === "resetPassword" || otpType==='activateAccount') {
        sendOtpAccountVerifyMessage(phone, phoneOtp);
      } else if (otpType === "login") {
        sendLoginOtpMessage(phone, phoneOtp);
      } else if (otpType === "signUp") {
        sendSignUpOtpMessage(phone, phoneOtp);
      } else {
        return res.status(404).json({ message: "Invalid Otp Type!" });
      }

      const token = jwt.sign(
        { ...req.body, phone,body:req.body },
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

        if(otpStore[otpKey].count<=0){
          return res.status(402).json({message:"Otp trying limit exceed!"})
        }

        const phoneOtp = otpStore[otpKey].otp;
        
        
        
        // Validate OTP
        if (`${userPhoneOtp}` != `${phoneOtp}`) {
          // await transaction.rollback(); // Rollback transaction
          otpStore[otpKey].count-=1;
          return res.status(400).send({ message: "Invalid OTP." });
        }
        //console.log(payload);
        req.payload = payload;
        const body=payload.body
        req.body={...req.body,...body}
        return next();
      } catch (err) {
        console.log(err);
        return res.status(503).json({ error: "Invalid Otp Signature!" });
      }
    }
    return res.status(404).json({error:"Otp Signatue Not Found!"})
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};
