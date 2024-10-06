const UserKyc = require("../../../Models/Kyc/userKyc");
const Piggybox = require("../../../Models/PiggyBox/piggyBox");
const TransactionHistory = require("../../../Models/PiggyBox/transactionHistory");
const User = require("../../../Models/User/users");
const sequelize = require("../../../database");

const { Op } = require("sequelize"); // For using comparison operators like Op.between

exports.getTransferInfo = async (req, res, next) => {
  const userId = req.user.id; // Get the user ID from the request

  try {
    // Step 1: Fetch PiggyBox information
    const piggyBox = await Piggybox.findOne({
      where: { UserId: userId }, // Find PiggyBox associated with the user
    });

    if (!piggyBox) {
      return res.status(404).json({ message: "PiggyBox not found." });
    }

    // Step 2: Fetch User KYC information
    const userKyc = await UserKyc.findOne({
      where: { UserId: req.user.id }, // Use candidateId to find user KYC
    });

    if (!userKyc) {
      return res
        .status(404)
        .json({ message: "User KYC information not found." });
    }

    // Step 3: Prepare the response data
    const responseData = {
      piggyBoxBalance: piggyBox.piggyBalance,
      kycStatus: userKyc.status, // You can customize what status to return if needed
      userKycAccepted: userKyc.userAggreementAccepted, // Check if KYC agreement is accepted
    };

    // Return success response
    return res.status(200).json(responseData);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

exports.getTransferUserInfo = async (req, res, next) => {
  const { candidateId } = req.body; // Assuming candidateId is provided in the request body

  try {
    // Step 1: Find the user by candidateId
    const user = await User.findOne({
      where: { candidateId }, // Find user with the provided candidateId
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Step 2: Return the user's name
    return res.status(200).json({ name: user.name });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

exports.getTransactionHistoryWithDate = async (req, res, next) => {
  const userId = req.user.id; // Get the user ID from the request
  const { fromDate, toDate } = req.body; // Extract fromDate and toDate from the request body

  try {
    // Validate the date inputs
    if (!fromDate || !toDate) {
      return res
        .status(400)
        .json({ message: "Both fromDate and toDate are required." });
    }

    // Fetch the transaction history for the user within the specified date range
    const transactions = await TransactionHistory.findAll({
      where: {
        UserId: userId, // Ensure we only get transactions for this user
        createdAt: {
          // Filter based on the createdAt timestamp
          [Op.between]: [new Date(fromDate), new Date(toDate)],
        },
      },
      order: [
        ["createdAt", "DESC"],
        ["id", "DESC"],
      ], // Optional: order by date and then by id
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

exports.getTopTransactions = async (req, res, next) => {
  const userId = req.user.id; // Get the user ID from the request

  try {
    // Fetch the top 10 transactions for the user
    const transactions = await TransactionHistory.findAll({
      where: { UserId: userId }, // Ensure we only get transactions for this user
      limit: 10, // Limit to the top 10 transactions
      order: [
        ["createdAt", "DESC"],
        ["id", "DESC"],
      ], // Optional: order by createdAt and then by id
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

exports.transferMoney = async (req, res, next) => {
  const userId = req.user.id; // Get the sender's user ID from the request
  const { amount, candidateId, name, userRemark } = req.body; // Extract transfer details from the request body

  // Start a transaction
  const t = await sequelize.transaction();

  try {
    // Fetch sender's piggybox and KYC status
    const senderPiggybox = await Piggybox.findOne({
      where: { UserId: userId },
      transaction: t,
    });
    const senderKyc = await UserKyc.findOne({
      where: { UserId: userId },
      transaction: t,
    });

    // Validate KYC agreement
    if (!senderKyc || !senderKyc.userAggreementAccepted) {
      return res
        .status(403)
        .json({ message: "User KYC agreement not accepted." });
    }

    // Check if the piggybox balance is sufficient after the transfer
    const newSenderBalance = senderPiggybox.piggyBalance - amount;
    if (newSenderBalance < 2000) {
      return res
        .status(400)
        .json({
          message:
            "Insufficient funds. Minimum balance should be maintained at 2000 after withdrawal.",
        });
    }

    // Fetch receiver's user info using candidateId
    const receiver = await User.findOne({ where: { candidateId, name } });
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    // Start updating balances and creating transaction records
    const senderRemark = `Transferred to ${receiver.candidateId}`;
    const receiverRemark = `Received from ${req.user.candidateId}`;

    // Update sender's piggybox balance
    await senderPiggybox.update(
      { piggyBalance: newSenderBalance },
      { transaction: t }
    );

    // Create transaction history for sender
    await TransactionHistory.create(
      {
        UserId: userId,
        transactionType: "candidateTransfer",
        remark: senderRemark,
        debit: amount,
        balance: newSenderBalance,
      },
      { transaction: t }
    );

    // Update receiver's piggybox balance
    const receiverPiggybox = await Piggybox.findOne({
      where: { UserId: receiver.id },
      transaction: t,
    });
    const newReceiverBalance = receiverPiggybox.piggyBalance + amount;
    await receiverPiggybox.update(
      { piggyBalance: newReceiverBalance },
      { transaction: t }
    );

    // Create transaction history for receiver
    await TransactionHistory.create(
      {
        UserId: receiver.id,
        transactionType: "candidateTransfer",
        remark: receiverRemark,
        credit: amount,
        balance: newReceiverBalance,
      },
      { transaction: t }
    );

    // Commit the transaction
    await t.commit();

    return res.status(200).json({ message: "Transfer successful." });
  } catch (err) {
    // Rollback the transaction in case of error
    await t.rollback();
    console.error(err);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};
