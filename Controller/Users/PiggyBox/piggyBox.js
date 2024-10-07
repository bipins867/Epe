const UserKyc = require("../../../Models/Kyc/userKyc");
const Piggybox = require("../../../Models/PiggyBox/piggyBox");
const TransactionHistory = require("../../../Models/PiggyBox/transactionHistory");
const { savePaymentRequest, verifyPaymentRequest } = require("./phonePayUtils");
const Transaction = require("../../../Models/PiggyBox/transaction");
const sequelize = require("../../../database");
const { Sequelize } = require("sequelize");

exports.addFunds = async (req, res, next) => {
  const { amount } = req.body; // Get amount from request body
  const { candidateId, phone, id: userId } = req.user; // Get candidate ID, mobile, and userId from req.user

  // Start a Sequelize transaction
  const t = await sequelize.transaction();

  try {
    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount provided." });
    }

    // Get the Piggybox of the user to fetch balance
    const userPiggybox = await Piggybox.findOne({
      where: { UserId: userId },
      transaction: t, // Include transaction
    });

    if (!userPiggybox) {
      throw new Error("Piggybox not found for the user.");
    }

    const currentBalance = userPiggybox.piggyBalance;

    // Call savePaymentRequest function
    const { paymentResult, merchantTransactionId, merchantUserId } =
      await savePaymentRequest(candidateId, phone, amount);

    if (
      paymentResult &&
      paymentResult.data &&
      paymentResult.data.instrumentResponse &&
      paymentResult.data.instrumentResponse.redirectInfo
    ) {
      const redirectInfo = paymentResult.data.instrumentResponse.redirectInfo; // Get the redirect URL from response

      // Create a new Transaction
      const transaction = await Transaction.create(
        {
          merchantTransactionId,
          merchantUserId,
          isVerified: false, // Initially mark as unverified
          amount,
          status: "pending", // Transaction status as pending
          time: new Date(),
          UserId: userId, // Associate with the user
        },
        { transaction: t } // Include transaction
      );

      // Create a new TransactionHistory
      const transactionHistory = await TransactionHistory.create(
        {
          transactionType: "paymentGateway", // Transaction type as payment gateway
          merchantUserId,
          merchantTransactionId,
          remark: `Payment of ₹${amount} initiated via gateway.`,
          credit: 0, // No credit for this entry
          debit: 0, // No debit for this entry yet
          balance: currentBalance, // Use the user's piggybox balance
          UserId: userId, // Associate with the user
        },
        { transaction: t } // Include transaction
      );

      // Commit the transaction if all operations succeed
      await t.commit();

      // Return the redirect URL to the user
      return res.status(200).json({ redirectInfo });
    } else {
      // If savePaymentRequest fails, rollback the transaction
      await t.rollback();
      return res
        .status(500)
        .json({ message: "Failed to process payment. Please try again." });
    }
  } catch (error) {
    console.error("Error in addFunds:", error);
    // Rollback the transaction in case of error
    await t.rollback();
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

exports.redirectedPaymentInfo = async (req, res, next) => {
  const merchantTransactionId = req.params.merchantTransactionId;
  return res.redirect(`/user/piggyBox/paymentStatus/${merchantTransactionId}`);
};

exports.callbackPaymentInfo = async (req, res, next) => {
  console.log(req.body);
  return res.json({ id: 1 });
};

exports.checkPaymentStatus = async (req, res, next) => {
  const t = await sequelize.transaction(); // Start a Sequelize transaction
  try {
    const { merchantTransactionId } = req.body;

    // Find the transaction by merchantTransactionId
    const transaction = await Transaction.findOne({
      where: { merchantTransactionId },
      transaction: t,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    // Check if the transaction is already verified//transaction.isVerified)
    if (transaction.isVerified) {
      return res.status(201).json({
        merchantTransactionId: transaction.merchantTransactionId,
        status: transaction.status === "Successfull" ? "Successfull" : "Failed",
        amount: transaction.amount,
        time: transaction.time,
      });
    }

    // Proceed to check payment status from PhonePay API
    let response = await verifyPaymentRequest(merchantTransactionId);
    response = response.data;

    if (response.data && response.data.state === "COMPLETED") {
      // Update transaction to mark as verified and successful
      transaction.isVerified = true;
      transaction.status = "Successfull";
      await transaction.save({ transaction: t });

      // Get the user's Piggybox and update the balance
      const piggyBox = await Piggybox.findOne({
        where: { UserId: req.user.id },
        transaction: t,
      });

      if (!piggyBox) {
        throw new Error("User's Piggybox not found.");
      }

      const newBalance =
        parseFloat(piggyBox.piggyBalance) + parseFloat(transaction.amount);
      piggyBox.piggyBalance = newBalance;
      await piggyBox.save({ transaction: t });

      // Create a new transaction history record for successful payment
      await TransactionHistory.create(
        {
          transactionType: "paymentGateway",
          merchantUserId: transaction.merchantUserId,
          merchantTransactionId: transaction.merchantTransactionId,
          remark: `Payment Successful of amount ${transaction.amount}`,
          credit: transaction.amount,
          debit: 0,
          balance: newBalance,
          UserId: req.user.id,
        },
        { transaction: t }
      );

      // Commit the transaction
      await t.commit();

      // Respond with success
      return res.status(200).json({
        merchantTransactionId: transaction.merchantTransactionId,
        status: "Successful",
        amount: transaction.amount,
        time: transaction.time,
      });
    } else {
      // Handle failed payment case
      transaction.isVerified = true;
      transaction.status = "Failed";
      await transaction.save({ transaction: t });

      // Create a new transaction history record for failed payment
      await TransactionHistory.create(
        {
          transactionType: "paymentGateway",
          merchantUserId: transaction.merchantUserId,
          merchantTransactionId: transaction.merchantTransactionId,
          remark: `Payment Failed for transaction ${merchantTransactionId}`,
          credit: 0,
          debit: 0,
          UserId: req.user.id,
          balance: await Piggybox.findOne({
            where: { UserId: req.user.id },
            transaction: t,
          }).then((piggyBox) => piggyBox.piggyBalance), // Get current balance without modifying it
        },
        { transaction: t }
      );

      // Commit the transaction even if failed
      await t.commit();

      return res.status(200).json({
        merchantTransactionId: transaction.merchantTransactionId,
        status: "Failed",
        amount: transaction.amount,
        time: transaction.time,
      });
    }
  } catch (err) {
    // Rollback transaction in case of error
    await t.rollback();
    console.error("Error in checkPaymentStatus:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};
exports.getPiggyBoxInfo = async (req, res, next) => {
  try {
    // Get the user information from the request
    const userId = req.user.id; // Assuming req.user contains the authenticated user's info
    const candidateId = req.user.candidateId;

    // Fetch user KYC information
    const userKyc = await UserKyc.findOne({
      where: { customerId: candidateId }, // Using candidateId to find associated KYC
    });

    // Fetch user's piggybox information
    const piggyBox = await Piggybox.findOne({
      where: { UserId: userId },
    });

    // Fetch transaction history for the user
    const transactionHistory = await TransactionHistory.findAll({
      where: { UserId: userId },
      order: [["createdAt", "DESC"]], // Assuming merchantUserId corresponds to the user's ID
    });

    // Prepare the response data
    const response = {
      name: req.user.name,
      customerId: candidateId,
      kycStatus: userKyc ? userKyc.status : "Pending.",
      piggyboxBalance: piggyBox ? piggyBox.piggyBalance : 0,
      unclearedBalance: piggyBox ? piggyBox.unclearedBalance : 0,
      isFundedFirst: piggyBox ? piggyBox.isFundedFirst : false,
      transactionHistory,
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

exports.getTransactionHistory = async (req, res, next) => {
  const { fromDate, toDate } = req.body; // Extract dates from the request body
  const userId = req.user.id; // Get the user ID from the request

  try {
    // Validate date inputs
    if (!fromDate || !toDate) {
      return res
        .status(400)
        .json({ message: "Both 'fromDate' and 'toDate' are required." });
    }

    // Fetch transaction history for the user within the specified date range
    const transactions = await TransactionHistory.findAll({
      where: {
        UserId: userId,
        createdAt: {
          [Sequelize.Op.between]: [new Date(fromDate), new Date(toDate)], // Use Sequelize's Op.between to filter by date
        },
      },
      order: [["createdAt", "DESC"]], // Optional: Order transactions by creation date
    });

    // Return the transaction history
    return res.status(200).json(transactions);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};
