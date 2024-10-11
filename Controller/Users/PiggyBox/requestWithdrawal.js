const { Sequelize } = require("sequelize");
const UserKyc = require("../../../Models/Kyc/userKyc");
const BankDetails = require("../../../Models/PiggyBox/bankDetails");
const Piggybox = require("../../../Models/PiggyBox/piggyBox");
const RequestWithdrawal = require("../../../Models/PiggyBox/requestWithdrawal");
const sequelize = require("../../../database");
const TransactionHistory = require("../../../Models/PiggyBox/transactionHistory");

function generateRandomRequestId() {
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
exports.generateRandomRequestId=generateRandomRequestId;

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
  const user=req.user;
  // Start a Sequelize transaction
  let transaction;

  try {

    
    // Step 1: Check if KYC agreement is accepted
    const userKyc = await UserKyc.findOne({
      where: { customerId: req.user.candidateId }, // Use candidateId to find user KYC
     // transaction,
    });

    if (!userKyc || !userKyc.userAggreementAccepted) {
      //await transaction.rollback();
      return res
        .status(403)
        .json({ message: "KYC agreement not accepted or KYC not Completed!." });
    }

    // Step 2: Check if bank details exist
    const bankDetails = await BankDetails.findOne({
      where: { UserId: userId }, // Check for bank details associated with the user
      //transaction,
    });

    if (!bankDetails) {
      //await transaction.rollback();
      return res.status(400).json({
        message: "Bank details not found. Please provide bank information.",
      });
    }

    // Step 3: Check the user's piggybox balance
    const piggyBox = await Piggybox.findOne({
      where: { UserId: userId }, // Fetch the user's piggybox
     // transaction,
    });

    if (!piggyBox) {
     // await transaction.rollback();
      return res.status(400).json({ message: "PiggyBox not found." });
    }

    const pendingWithdrawals = await RequestWithdrawal.findOne({
      where: { UserId: user.id, status: "pending" },
      //   transaction,
    });

    if (pendingWithdrawals) {
      return res.status(400).json({
        success: false,
        message: "You have already a pending withdrawal request.",
      });
    }

    if (parseFloat(amount) <= 0) {
      return res.status(405).json({
        message: "Invalid Amount the value should be greater than 0.",
      });
    }

    // Check if the withdrawal would violate the minimum balance requirement
    const remainingBalance =
      parseFloat(piggyBox.piggyBalance) - parseFloat(amount); // Calculate remaining balance after withdrawal

    if (remainingBalance < 2000) {
      //await transaction.rollback();
      return res.status(400).json({
        message:
          "Insufficient funds. Minimum balance of 2000 must be maintained after withdrawal.",
      });
    }

    // Step 4: Validate withdrawal amount
    if (!amount || amount <= 0) {
      //await transaction.rollback();
      return res.status(400).json({ message: "Invalid withdrawal amount." });
    }
    transaction = await sequelize.transaction();
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

    // Step 6: Add a new TransactionHistory entry for the withdrawal
    const newBalance = parseFloat(piggyBox.piggyBalance) - parseFloat(amount);
    await TransactionHistory.create(
      {
        transactionType: "withdrawal",
        remark: "User Withdrawal requested",
        credit: 0,
        debit: amount,
        balance: newBalance,
        UserId: userId,
      },
      { transaction }
    );

    // Step 7: Get the last `requestId` and increment it
    // const lastRequest = await RequestWithdrawal.findOne({
    //   order: [["requestId", "DESC"]], // Get the latest request ID
    //   transaction,
    // });

    let newRequestId = generateRandomRequestId(); // Start from 2000000 if there are no records
    // if (lastRequest) {
    //   newRequestId = parseInt(lastRequest.requestId) + 1; // Increment from the last requestId
    // }

    // Step 8: Create the withdrawal request with the new requestId
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

    // Step 9: Commit the transaction (everything successful)
    await transaction.commit();

    // Return success response
    return res.status(201).json({
      message: "Withdrawal request submitted successfully.",
      requestId: withdrawalRequest.requestId,
    });
  } catch (err) {
    // Rollback the transaction if any error occurs
    if (transaction) {
      await transaction.rollback();
    }

    console.error(err);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

// Controller to handle the cancellation of a pending withdrawal request
exports.requestForCancelWithdrawal = async (req, res, next) => {
  const userId = req.user.id; // Get the user ID from the request
  const user=req.user;
  // Start a Sequelize transaction
  let transaction;

  try {

    
    // Step 1: Fetch the recent withdrawal request with a "pending" status
    const recentWithdrawalRequest = await RequestWithdrawal.findOne({
      where: { UserId: userId, status: 'pending' },
    });

    if (!recentWithdrawalRequest) {
      // If no pending request is found, return an error response
      return res.status(404).json({
        success: false,
        message: 'No pending withdrawal request found for cancellation.',
      });
    }

    const { amount } = recentWithdrawalRequest; // Get the withdrawal amount from the recent request

    // Step 2: Check and update the user's piggybox balances
    const piggyBox = await Piggybox.findOne({ where: { UserId: userId } });

    if (!piggyBox) {
      return res.status(400).json({ message: 'PiggyBox not found.' });
    }

    // Use parseFloat to handle balance calculations
    const updatedPiggyBalance = parseFloat(piggyBox.piggyBalance) + parseFloat(amount);
    const updatedUnclearedBalance = parseFloat(piggyBox.unclearedBalance) - parseFloat(amount);

    // Step 3: Start a transaction for atomic operations
    transaction = await sequelize.transaction();

    // Update the Piggybox balance and unclearedBalance
    await Piggybox.update(
      {
        piggyBalance: updatedPiggyBalance,
        unclearedBalance: updatedUnclearedBalance,
      },
      {
        where: { UserId: userId },
        transaction,
      }
    );

    // Step 4: Create a new TransactionHistory entry for the cancellation
    await TransactionHistory.create(
      {
        transactionType: 'withdrawal',
        remark: 'User Withdrawal Cancelled',
        credit: amount, // Refund the withdrawn amount
        debit: 0,
        balance: updatedPiggyBalance,
        UserId: userId,
      },
      { transaction }
    );

    // Step 5: Update the withdrawal request status to "canceled"
    await RequestWithdrawal.update(
      { status: 'canceled' },
      {
        where: { id: recentWithdrawalRequest.id },
        transaction,
      }
    );

    // Step 6: Commit the transaction (all operations successful)
    await transaction.commit();

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Withdrawal request has been successfully canceled.',
      newBalance: updatedPiggyBalance,
      requestId: recentWithdrawalRequest.requestId,
    });
  } catch (err) {
    // Rollback the transaction if any error occurs
    if (transaction) {
      await transaction.rollback();
    }

    console.error('Error while cancelling withdrawal request:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error. Please try again later.' });
  }
};
