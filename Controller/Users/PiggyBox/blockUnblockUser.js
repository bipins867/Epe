const { Sequelize } = require("sequelize");
const Piggybox = require("../../../Models/PiggyBox/piggyBox");
const RequestWithdrawal = require("../../../Models/PiggyBox/requestWithdrawal");
const sequelize = require("../../../database");
const { generateRandomRequestId } = require("./requestWithdrawal");

exports.userAccountClosingRequest = async (req, res, next) => {
  let transaction; // Start a transaction
  try {
    const user = req.user; // Accessing the user directly from req

    // Check if the user is blocked
    if (user.isBlocked) {
      return res
        .status(400)
        .json({ success: false, message: "User is blocked." });
    }

    // Check if the account is already closed
    if (!user.isActive) {
      return res
        .status(400)
        .json({ success: false, message: "User account is already closed." });
    }

    // Check if the user has already requested account closure
    if (user.isRequestedClouser) {
      return res.status(400).json({
        success: false,
        message: "Account closure has already been requested.",
      });
    }

    // Check for any pending withdrawal requests
    const pendingWithdrawals = await RequestWithdrawal.findOne({
      where: { UserId: user.id, status: "pending" },
      //   transaction,
    });

    if (pendingWithdrawals) {
      return res.status(400).json({
        success: false,
        message: "You have  pending withdrawal requests.",
      });
    }

    // Fetch the user's Piggybox details
    const piggybox = await Piggybox.findOne({ where: { UserId: user.id } });

    //generating random id  request
    const requestId = generateRandomRequestId();

    //Inintilizing the sequlize transaction
    transaction = await sequelize.transaction();

    // Deduct the piggyBalance and add it to unclearedBalance
    const totalBalance = piggybox.piggyBalance;
    piggybox.unclearedBalance += totalBalance;
    piggybox.piggyBalance = 0;

    await piggybox.save({ transaction });

    // Create a new withdrawal request

    await RequestWithdrawal.create(
      {
        requestId: requestId,
        requestDate: new Date(),
        candidateId: user.candidateId,
        phone: user.phone,
        amount: totalBalance,
        userRemark: "User request for closure.",
        status: "pending",
        UserId: user.id, // Associate the withdrawal request with the user
      },
      { transaction }
    );

    // Update the user's closure request flag
    user.isRequestedClouser = true;
    await user.save({ transaction });

    // Commit the transaction
    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Account closure request submitted successfully.",
    });
  } catch (error) {
    if (transaction) {
      await transaction.rollback(); // Rollback the transaction in case of any errors
    }
    console.error("Error in userAccountClouserRequest:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the request.",
    });
  }
};

exports.userAccountOpen = async (req, res, next) => {
  let transaction; // Start a transaction
  try {
    const user = req.user; // Accessing the user directly from req

    // Check if the user is blocked
    if (user.isBlocked) {
      return res
        .status(400)
        .json({ success: false, message: "User is blocked." });
    }

    // Check if the account is already open
    if (user.isActive) {
      return res
        .status(400)
        .json({ success: false, message: "User account is already open." });
    }

    // Fetch the user's Piggybox details
    const piggybox = await Piggybox.findOne({ where: { UserId: user.id } });

    //Initiallizing the transaction..
    transaction = await sequelize.transaction();

    // Update the Piggybox to reset isFundedFirst
    piggybox.isFundedFirst = false;
    await piggybox.save({ transaction });

    // Update the user's account status
    user.isActive = true;
    user.isRequestedClouser = false;
    user.isByReferralUsed = true;
    await user.save({ transaction });

    // Commit the transaction
    await transaction.commit();

    return res
      .status(200)
      .json({ success: true, message: "Account opened successfully." });
  } catch (error) {
    if (transaction) {
      await transaction.rollback(); // Rollback the transaction in case of any errors
    }
    console.error("Error in userAccountOpeningRequest:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while processing the request.",
      });
  }
};
