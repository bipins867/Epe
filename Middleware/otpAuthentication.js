const { otpStore } = require("../Utils/MailService");

exports.sendOtp = async (req, res, next) => {
  try {
    const { otpAuthenticationToken, otpType } = req.body;

    if (otpAuthenticationToken) {
      try {
        const payload = jwt.verify(
          otpAuthenticationToken,
          process.env.JWT_SECRET_KEY
        );

        next();
      } catch (err) {
        return res.status(503).json({ error: "Invalid Signature!" });
      }
    }
    //Checking for authenticated user
    let phone;
    if (req.user) {
      phone = req.user.phone;
    } else {
      phone = req.body.phone;

      if (!phone) {
        return res.status(404).json({ message: "User Mobiler is Invalid!" });
      }
    }
    const phoneOtp = crypto.randomInt(100000, 999999).toString();

    otpStore[phone] = { phoneOtp };

    setTimeout(() => {
      delete otpStore[phone];
    }, 5 * 60 * 1000);

    await sendOtpToPhone(phone, phoneOtp);

    const token = jwt.sign({ ...req.body, phone }, process.env.JWT_SECRET_KEY, {
      expiresIn: "5m",
    });

    res.status(200).send({
      message: "OTP sent successfully.",
      otpAuthenticationToken: token,
      otpType: otpType,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};

exports.verifyOtp = (req, res, next) => {
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

        next();
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
