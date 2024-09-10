const User = require("../../../Models/User/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendOtpToEmail, sendOtpToPhone } = require("../../../Utils/utils");
const { otpStore } = require("../../../Utils/MailService");
const { Op } = require("sequelize");

exports.userSignUp = async (req, res, next) => {
  const { userEmailOtp, userPhoneOtp, signUpToken } = req.body;

  try {
    const token = signUpToken;
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const { name, email, phone, password } = payload;

    if (!otpStore[email]) {
      return res.status(400).send({ message: "OTP expired or invalid." });
    }

    const { emailOtp, phoneOtp } = otpStore[email];

    // Validate OTPs
    if (
      `${userEmailOtp}` != `${emailOtp}` ||
      `${userPhoneOtp}` != `${phoneOtp}`
    ) {
      return res.status(400).send({ message: "Invalid OTP." });
    }

    // OTP is valid, proceed with the sign-up
    // (Insert user registration logic here)

    // Clean up OTP entry after successful verification
    //delete otpStore[email];
    // Check if the user already exists
    // const existingUser = await User.findOne({ where: { email } });

    // if (existingUser) {
    //   return res
    //     .status(409)
    //     .json({ message: "User already exists. Please log in instead." }); // 409 Conflict
    // }

    // Hash the password before saving
    bcrypt.hash(password, 10, async (err, hashedPassword) => {
      if (err) {
        console.error("Error hashing password:", err);
        return res
          .status(500)
          .json({ message: "Internal server error. Please try again later." });
      }

      // Create the new user
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
      });

      return res
        .status(201)
        .json({ message: "SignUp Successful", userId: newUser.id }); // 201 Created
    });
  } catch (err) {
    console.error("Error during user sign-up:", err);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

exports.userLogin = async (req, res, next) => {
  const { email, phone, password } = req.body;
  
  try {
    // Check if the user exists
    let user;
    if (email) {
      user = await User.findOne({ where: { email } });
    } else {
      user = await User.findOne({ where: { phone } });
    }

    if (!user) {
      return res.status(404).json({ error: "User doesn't exist" }); // 404 Not Found
    }

    // Compare the provided password with the stored hashed password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res
          .status(500)
          .json({ error: "Internal server error. Please try again later." });
      }

      if (isMatch) {
        // Generate a JWT token
        const token = jwt.sign(
          { name: user.name, id: user.id },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "2h", // Optional: specify token expiration time
          }
        );

        return res
          .status(200)
          .json({ status: "Login Successful", token, userId: user.id }); // 200 OK
      } else {
        return res.status(401).json({ error: "Invalid Password" }); // 401 Unauthorized
      }
    });
  } catch (err) {
    console.error("Error during user login:", err);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};

exports.userOtpVerify = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // Import Sequelize operators

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email }, // Check for the email
          { phone }, // Check for the phone number
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message:
          "User already exists. Please log in instead or change email/phone.",
      }); // 409 Conflict
    }

    // Generate random 6-digit OTPs for both email and phone
    const emailOtp = crypto.randomInt(100000, 999999).toString();
    const phoneOtp = crypto.randomInt(100000, 999999).toString();

    // Save OTPs in the in-memory object with a 5-minute expiry
    otpStore[email] = { emailOtp, phoneOtp };

    setTimeout(() => {
      delete otpStore[email]; // Remove OTPs from the store after 5 minutes
    }, 5 * 60 * 1000);
    console.log(otpStore);
    // Send OTPs to email and phone (pseudo-code)
    await sendOtpToEmail(email, emailOtp);
    await sendOtpToPhone(phone, phoneOtp);

    const token = jwt.sign(req.body, process.env.JWT_SECRET_KEY, {
      expiresIn: "5m", // Optional: specify token expiration time
    });

    res
      .status(200)
      .send({ message: "OTP sent successfully.", signUpToken: token });
  } catch (err) {
    console.error("Error during user login:", err);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};
