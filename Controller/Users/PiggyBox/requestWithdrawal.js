const { Sequelize } = require("sequelize");
const UserKyc = require("../../../Models/Kyc/userKyc");
const BankDetails = require("../../../Models/PiggyBox/bankDetails");
const Piggybox = require("../../../Models/PiggyBox/piggyBox");
const RequestWithdrawal = require("../../../Models/PiggyBox/requestWithdrawal");
const sequelize = require("../../../database");

exports.requestWithdrawalInfo = async (req, res, next) => {
  try {
    const userId = req.user.id; // Get the user ID from the request

    // Fetch piggyBox balance
    const piggyBox = await Piggybox.findOne({
      where: { UserId: userId },
    });

    // Fetch bank details
    const bankDetails = await BankDetails.findOne({
      where: { UserId: userId },
    });

    // Fetch KYC status
    const userKyc = await UserKyc.findOne({
      where: { customerId: req.user.candidateId }, // Using candidateId for the KYC lookup
    });

    // Fetch withdrawal history (top 10)
    const withdrawalHistory = await RequestWithdrawal.findAll({
      where: { UserId: userId },
      order: [["requestDate", "DESC"]], // Order by requestDate descending
      limit: 10, // Limit to top 10 requests
    });

    // Prepare the response data
    const response = {
      piggyBoxBalance: piggyBox ? piggyBox.piggyBalance : 0, // Fallback to 0 if no piggybox found
      bankDetails: bankDetails || {}, // Return bank details or empty object if not found
      kycStatus: userKyc ? userKyc.status : "Pending.", // Fallback if no KYC found
      kycAccepted: userKyc ? userKyc.userAggreementAccepted : false,
      withdrawalHistory,
    };

    // Return the response
    return res.status(200).json(response);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

exports.requestForWithdrawal = async (req, res, next) => {
  const { amount, userRemark } = req.body; // Extract amount and user remark from the request body
  const userId = req.user.id; // Get the user ID from the request

  // Start a Sequelize transaction
  const transaction = await sequelize.transaction();

  try {
    // Step 1: Check if KYC agreement is accepted
    const userKyc = await UserKyc.findOne({
      where: { customerId: req.user.candidateId }, // Use candidateId to find user KYC
      transaction,
    });

    if (!userKyc || !userKyc.userAggreementAccepted) {
      await transaction.rollback();
      return res
        .status(403)
        .json({ message: "KYC agreement not accepted or KYC not Completed!." });
    }

    // Step 2: Check if bank details exist
    const bankDetails = await BankDetails.findOne({
      where: { UserId: userId }, // Check for bank details associated with the user
      transaction,
    });

    if (!bankDetails) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Bank details not found. Please provide bank information.",
      });
    }

    // Step 3: Check the user's piggybox balance
    const piggyBox = await Piggybox.findOne({
      where: { UserId: userId }, // Fetch the user's piggybox
      transaction,
    });

    if (!piggyBox) {
      await transaction.rollback();
      return res.status(400).json({ message: "PiggyBox not found." });
    }

    if (parseFloat(amount) <= 0) {
      return res
        .status(405)
        .json({ message: "Invalid Amount the value should be greter than 0." });
    }

    // Check if the withdrawal would violate the minimum balance requirement
    const remainingBalance =
      parseFloat(piggyBox.piggyBalance) - parseFloat(amount); // Calculate remaining balance after withdrawal

    if (remainingBalance < 2000) {
      await transaction.rollback();
      return res.status(400).json({
        message:
          "Insufficient funds. Minimum balance of 2000 must be maintained after withdrawal.",
      });
    }

    // Step 4: Validate withdrawal amount
    if (!amount || amount <= 0) {
      await transaction.rollback();
      return res.status(400).json({ message: "Invalid withdrawal amount." });
    }

    // Step 5: Deduct amount from piggyBox balance and add to unclearedBalance
    const updatedPiggyBox = await Piggybox.update(
      {
        piggyBalance: Sequelize.literal(`piggyBalance - ${amount}`), // Deduct amount from piggyBalance
        unclearedBalance: Sequelize.literal(`unclearedBalance + ${amount}`), // Add amount to unclearedBalance
      },
      {
        where: { UserId: userId },
        transaction,
      }
    );

    // Step 6: Get the last `requestId` and increment it
    const lastRequest = await RequestWithdrawal.findOne({
      order: [["requestId", "DESC"]], // Get the latest request ID
      transaction,
    });

    let newRequestId = 2000000; // Start from 2000000 if there are no records
    if (lastRequest) {
      newRequestId = parseInt(lastRequest.requestId) + 1; // Increment from the last requestId
    }

    // Step 7: Create the withdrawal request with the new requestId
    const withdrawalRequest = await RequestWithdrawal.create(
      {
        requestId: newRequestId, // Assign the new requestId
        requestDate: new Date(), // Current date and time for the request
        amount,
        userRemark: userRemark || null, // User remark can be optional
        status: "Pending", // Initial status for the withdrawal request
        UserId: userId,
        candidateId: req.user.candidateId,
        phone: req.user.phone, // Associate with the user
      },
      { transaction }
    );

    // Step 8: Commit the transaction (everything successful)
    await transaction.commit();

    // Return success response
    return res.status(201).json({
      message: "Withdrawal request submitted successfully.",
      requestId: withdrawalRequest.requestId,
    });
  } catch (err) {
    // Rollback the transaction if any error occurs
    if (transaction) await transaction.rollback();

    console.error(err);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};
