const User = require("../../../Models/User/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendOtpToPhone } = require("../../../Utils/utils");
const { otpStore } = require("../../../Utils/MailService");
const { Op } = require("sequelize");

exports.userSignUp = async (req, res, next) => {
  const { userPhoneOtp, signUpToken } = req.body;

  try {
    const token = signUpToken;
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const { name, email, phone, password } = payload;

    // Use phone as the primary field for OTP validation
    const otpKey = phone ;//|| email; // Use phone if email is absent

    if (!otpStore[otpKey]) {
      return res.status(400).send({ message: "OTP expired or invalid." });
    }

    const { phoneOtp } = otpStore[otpKey];

    // Validate OTP
    if (`${userPhoneOtp}` != `${phoneOtp}`) {
      return res.status(400).send({ message: "Invalid OTP." });
    }

    // OTP is valid, proceed with the sign-up
    bcrypt.hash(password, 10, async (err, hashedPassword) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Internal server error. Please try again later." });
      }

      // Create the new user (email can be null if not provided)
      const newUser = await User.create({
        name,
        email: email || null, // Email optional
        password: hashedPassword,
        phone,
      });

      return res
        .status(201)
        .json({ message: "SignUp Successful", userId: newUser.id });
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

exports.userLogin = async (req, res, next) => {
  const { phone, password } = req.body;

  try {
    // User will log in only with their phone number
    const user = await User.findOne({ where: { phone } });

    if (!user) {
      return res.status(404).json({ error: "User doesn't exist" });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Internal server error. Please try again later." });
      }

      if (isMatch) {
        // Generate a JWT token
        const token = jwt.sign(
          { name: user.name, id: user.id },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "2h" }
        );

        return res
          .status(200)
          .json({ status: "Login Successful", token, userId: user.id });
      } else {
        return res.status(401).json({ error: "Invalid Password" });
      }
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};

exports.userOtpVerify = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // Use Sequelize to find an existing user by phone or email
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message:
          "User already exists. Please log in instead or change email/phone.",
      });
    }

    // Generate random 6-digit OTP for phone
    const phoneOtp = crypto.randomInt(100000, 999999).toString();

    // Store OTP based on the phone (email is optional)
    otpStore[phone] = { phoneOtp };

    setTimeout(() => {
      delete otpStore[phone];
    }, 5 * 60 * 1000);

    // Send OTP to phone
    await sendOtpToPhone(phone, phoneOtp);

    const token = jwt.sign(req.body, process.env.JWT_SECRET_KEY, {
      expiresIn: "5m",
    });

    res.status(200).send({ message: "OTP sent successfully.", signUpToken: token });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};


exports.userResendOtp = async (req, res, next) => {
  const { signUpToken } = req.body;

  try {
    // Verify the signUpToken
    const payload = jwt.verify(signUpToken, process.env.JWT_SECRET_KEY);
    const { phone } = payload;

    // Check if the phone exists in the otpStore
    if (!otpStore[phone]) {
      return res.status(400).json({ message: "OTP expired or invalid." });
    }

    // Generate a new OTP for the phone
    const newOtp = crypto.randomInt(100000, 999999).toString();
    otpStore[phone].phoneOtp = newOtp;

    // Send the new OTP to the user's phone
    await sendOtpToPhone(phone, newOtp);

    // Refresh OTP expiration time to 5 more minutes
    setTimeout(() => {
      delete otpStore[phone];
    }, 5 * 60 * 1000);

    return res.status(200).json({ message: "OTP resent successfully to phone." });
  } catch (err) {
    console.error("Error during OTP resend:", err);
    return res.status(500).json({ message: "Internal server error. Please try again later." });
  }
};
