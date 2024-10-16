const User = require("../../../Models/User/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendOtpToPhone } = require("../../../Utils/utils");
const {
  otpStore,
  sendRegistrationTemplate,
  sendOtpAccountVerifyMessage,
  sendLoginOtpMessage,
  sendSignUpOtpMessage,
} = require("../../../Utils/MailService");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const Referrals = require("../../../Models/PiggyBox/referrals");
const ReferredUser = require("../../../Models/PiggyBox/referredUsers");
const Piggybox = require("../../../Models/PiggyBox/piggyBox");
const sequelize = require("../../../database");

function generateRandomCandidateId() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // Only letters
  const numbers = "0123456789"; // Only digits

  let letterPart = "";
  let numberPart = "";

  // Generate the 5-letter part
  for (let i = 0; i < 5; i++) {
    letterPart += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  // Generate the 5-digit part
  for (let i = 0; i < 5; i++) {
    numberPart += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  // Combine both parts
  return letterPart + numberPart;
}

exports.userSignUp = async (req, res, next) => {
  let transaction; // Start the transaction

  try {
    const { name, email, phone, password, employeeId, byReferallId } =
      req.payload;

    // Find the last candidateId and increment by 1

    const newCandidateId = generateRandomCandidateId();
    transaction = await sequelize.transaction();
    // Check if byReferallId exists and is valid
    if (byReferallId && byReferallId.trim() !== "") {
      const referral = await Referrals.findOne({
        where: { referralId: byReferallId },
        // transaction,
      });

      if (!referral) {
        // await transaction.rollback(); // Rollback transaction
        return res.status(400).send({ message: "Invalid referral ID." });
      }

      // Update referral statistics
      await referral.increment("noOfReferrals", { by: 1, transaction });
      await referral.increment("pendingReferrals", { by: 1, transaction });

      // Create a new ReferredUser associated with the valid referral
      await ReferredUser.create(
        {
          candidateId: newCandidateId,
          name,
          status: "pending",
          dateOfJoining: new Date(),
          ReferralId: referral.id, // Associate with the referral
        },
        { transaction }
      );
    }

    // OTP is valid, proceed with the sign-up
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user, ensuring employeeId is empty string if null
    const newUser = await User.create(
      {
        candidateId: newCandidateId,
        name,
        email: email || null, // Email optional
        phone,
        password: hashedPassword,
        employeeId: employeeId || "", // Set employeeId as empty string if null
        byReferallId: byReferallId || null, // Store referral ID if present
      },
      { transaction }
    );

    // Create a new referral for the new user with a UUID
    const newReferral = await Referrals.create(
      {
        referralId: uuidv4(), // Generate a UUID for the referral ID
        noOfReferrals: 0, // Initially 0
        pendingReferrals: 0, // Initially 0
        UserId: newUser.id, // Associate the referral with the new user
      },
      { transaction }
    );

    // Create an associated Piggybox for the new user
    const newPiggybox = await Piggybox.create(
      {
        piggyBalance: 0, // Initial balance
        interestBalance: 0, // Initial interest balance
        isFundedFirst: false, // No funding initially
        UserId: newUser.id, // Associate with the new user
      },
      { transaction }
    );

    // If everything is successful, commit the transaction
    await transaction.commit();

    sendRegistrationTemplate(phone, newCandidateId);

    return res.status(201).json({
      message: "SignUp Successful",
      userId: newUser.id,
      referralId: newReferral.referralId, // Return the referral ID
      piggyBoxId: newPiggybox.id, // Return the piggybox ID
    });
  } catch (err) {
    // If any error occurs, rollback the transaction
    console.log(err);
    if (transaction) {
      await transaction.rollback();
    }
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

exports.userLogin = async (req, res, next) => {
  const { phone, password } = req.payload;
  //console.log(req.payload);
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
      const expiresIn = process.env.NODE_ENV === "testing" ? "2d" : "5m";
      if (isMatch) {
        // Generate a JWT token
        const token = jwt.sign(
          { name: user.name, id: user.id },
          process.env.JWT_SECRET_KEY,
          { expiresIn: expiresIn }
        );

        return res
          .status(200)
          .json({ status: "Login Successful", token, userId: user.id });
      } else {
        return res.status(401).json({ error: "Invalid Password" });
      }
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};

exports.getUserInfo = async (req, res, next) => {
  try {
    // Verify the signUpToken

    const { phone } = req.payload;

    const user = await User.findOne({
      where: {
        phone,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    return res.status(200).json({
      candidateId: user.candidateId,
      phone: user.phone,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("Error during OTP resend:", err);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

exports.changeUserPassword = async (req, res, next) => {
  const { phone } = req.payload;
  const { password } = req.body;

  try {
    // Find the user by phone number
    const user = await User.findOne({
      where: { phone },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (!password) {
      return res.status(400).send({ message: "Invalid Password!" });
    }
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    user.password = hashedPassword; // Assuming 'password' is a field in your User model

    await user.save(); // Save the updated user record

    // Optionally, you can return a success message
    return res.status(200).json({ message: "Password changed successfully." });
  } catch (err) {
    console.error("Error during password change:", err);

    // Handle specific error cases
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

exports.userOtpVerify = async (req, res, next) => {
  try {
    const { phone } = req.body;

    // Use Sequelize to find an existing user by phone or email
    const existingUser = await User.findOne({
      where: {
        phone,
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

    res.status(200).send({
      message: "OTP sent successfully.",
      signUpToken: token,
      type: "signUp",
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};

exports.userResetOrForgetPasswordOtpVerify = async (req, res, next) => {
  try {
    const { phone, candidateId } = req.body;

    // Use Sequelize to find an existing user by phone or email
    const existingUser = await User.findOne({
      where: {
        phone,
        candidateId,
      },
    });

    if (!existingUser) {
      return res.status(409).json({
        message: "User don't exists.",
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

    res.status(200).send({
      message: "OTP sent successfully.",
      signUpToken: token,
      type: "resetPassword",
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};

exports.userForgetCandidateIdOtpVerify = async (req, res, next) => {
  try {
    const { phone } = req.body;

    // Use Sequelize to find an existing user by phone or email
    const existingUser = await User.findOne({
      where: {
        phone,
      },
    });

    if (!existingUser) {
      return res.status(409).json({
        message: "User don't exists.",
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

    res.status(200).send({
      message: "OTP sent successfully.",
      signUpToken: token,
      type: "forgetCandidateId",
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};

exports.userResendOtp = async (req, res, next) => {
  const { otpAuthenticationToken, otpType } = req.body;

  try {
    // Verify the otpAuthenticationToken
    const payload = jwt.verify(
      otpAuthenticationToken,
      process.env.JWT_SECRET_KEY
    );
    const { phone } = payload;

    // Check if the phone exists in the otpStore
    if (!otpStore[phone]) {
      return res.status(400).json({ message: "OTP expired or invalid." });
    }

    if (otpStore[phone].count <= 0) {
      return res.status(402).json({ message: "Otp trying limit exceed!" });
    }

    // Generate a new OTP for the phone
    const newOtp = crypto.randomInt(100000, 999999).toString();
    otpStore[phone] = { otp: newOtp, count: otpStore[phone].count - 1 };

    if (otpType === "forgetCandidateId" || otpType === "resetPassword") {
      sendOtpAccountVerifyMessage(phone, newOtp);
    } else if (otpType === "login") {
      sendLoginOtpMessage(phone, newOtp);
    } else if (otpType === "signUp") {
      sendSignUpOtpMessage(phone, newOtp);
    } else {
      return res.status(404).json({ message: "Invalid Otp Type!" });
    }

    // Refresh OTP expiration time to 5 more minutes
    setTimeout(() => {
      delete otpStore[phone];
    }, 5 * 60 * 1000);

    return res
      .status(200)
      .json({ message: "OTP resent successfully to phone." });
  } catch (err) {
    console.error("Error during OTP resend:", err);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

exports.activateUserAccount = async (req, res) => {
  const { phone } = req.body;

  // Validate that the phone is provided
  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Phone number is required.",
    });
  }

  let t; // Start a transaction

  try {
    // Find the user by phone number
    const user = await User.findOne({ where: { phone } });

    // If the user is not found
    if (!user) {
      //await t.rollback(); // Rollback transaction on error
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check if the user is blocked
    if (user.isBlocked) {
      //await t.rollback(); // Rollback transaction on error
      return res.status(403).json({
        success: false,
        message: "User account is blocked. Please contact support.",
      });
    }

    // Check if the user is already active
    if (user.isActive) {
      //await t.rollback(); // Rollback transaction on error
      return res.status(403).json({
        success: true,
        message: "User account is already active.",
      });
    }

    // Find the user's Piggybox
    const piggybox = await Piggybox.findOne({
      where: { UserId: user.id },
      //transaction: t,
    });

    if (!piggybox) {
      //await t.rollback(); // Rollback transaction if Piggybox is not found
      return res.status(404).json({
        success: false,
        message: "User's Piggybox not found.",
      });
    }
    t = await sequelize.transaction();

    // Update the user's status to active
    user.isActive = true;
    await user.save({ transaction: t });

    // Update Piggybox's isFundedFirst to false
    piggybox.isFundedFirst = false;
    await piggybox.save({ transaction: t });

    // Commit the transaction
    await t.commit();

    return res.status(200).json({
      success: true,
      message: "User account activated and Piggybox updated successfully.",
      user: {
        phone: user.phone,
        isActive: user.isActive,
        candidateId: user.candidateId,
      },
    });
  } catch (error) {
    // Rollback transaction on any error
    console.error(
      "Error activating user account and updating Piggybox:",
      error
    );
    if (t) {
      await t.rollback();
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};
