const UserKyc = require("../../../Models/Kyc/userKyc");
const Piggybox = require("../../../Models/PiggyBox/piggyBox");
const TransactionHistory = require("../../../Models/PiggyBox/transactionHistory");
const { savePaymentRequest, verifyPaymentRequest } = require("./phonePayUtils");
const Transaction = require("../../../Models/PiggyBox/transaction");
const sequelize = require("../../../database");
const { Sequelize } = require("sequelize");
const User = require("../../../Models/User/users");
const Referrals = require("../../../Models/PiggyBox/referrals");
const ReferredUser = require("../../../Models/PiggyBox/referredUsers");

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

    if (!userPiggybox.isFundedFirst) {
      if (amount < 1) {
        return res.status(403).json({
          message:
            "First time payment must be greater than or equal to ₹2000.00",
        });
      }
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
      where: { merchantTransactionId, UserId: req.user.id },
      transaction: t,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    // Check if the transaction is already verified
    if (transaction.isVerified) {
      return res.status(201).json({
        merchantTransactionId: transaction.merchantTransactionId,
        status: transaction.status === "Successful" ? "Successful" : "Failed",
        amount: transaction.amount,
        time: transaction.time,
      });
    }

    // Proceed to check payment status from PhonePay API
    let response = await verifyPaymentRequest(merchantTransactionId);
    response = response.data;

    // Get the user's Piggybox and update the balance
    const piggyBox = await Piggybox.findOne({
      where: { UserId: req.user.id },
      transaction: t,
    });

    if (!piggyBox) {
      throw new Error("User's Piggybox not found.");
    }

    // Handle COMPLETED payment
    if (response.data && response.data.state === "COMPLETED") {
      // Mark the transaction as successful and verified
      transaction.isVerified = true;
      transaction.status = "Successful";
      await transaction.save({ transaction: t });

      const newBalance =
        parseFloat(piggyBox.piggyBalance) + parseFloat(transaction.amount);
      piggyBox.piggyBalance = newBalance;
      await piggyBox.save({ transaction: t });

      // Handle referral logic if first-time funding
      if (!piggyBox.isFundedFirst) {
        piggyBox.isFundedFirst = true;
        await piggyBox.save({ transaction: t });

        // Referral processing
        const user = await User.findByPk(req.user.id, { transaction: t });
        if (user.byReferallId) {
          const referral = await Referrals.findOne({
            where: { referralId: user.byReferallId },
            transaction: t,
          });

          if (referral) {
            const referringUser = await User.findByPk(referral.UserId, {
              transaction: t,
            });
            const referringPiggyBox = await Piggybox.findOne({
              where: { UserId: referringUser.id },
              transaction: t,
            });

            if (referringPiggyBox) {
              const updatedBalance =
                parseFloat(referringPiggyBox.piggyBalance) + 800;
              referringPiggyBox.piggyBalance = updatedBalance;
              await referringPiggyBox.save({ transaction: t });

              referral.pendingReferrals -= 1;
              await referral.save({ transaction: t });

              await ReferredUser.update(
                {
                  status: "completed",
                  dateOfCompletion: new Date(),
                },
                {
                  where: { candidateId: user.candidateId },
                  transaction: t,
                }
              );

              // Create a transaction history for the referring user
              await TransactionHistory.create(
                {
                  transactionType: "referral",
                  merchantUserId: referringUser.id,
                  merchantTransactionId: transaction.merchantTransactionId,
                  remark: `Referral bonus for candidateId ${user.candidateId}`,
                  credit: 800,
                  debit: 0,
                  balance: updatedBalance,
                  UserId: referringUser.id,
                },
                { transaction: t }
              );
            }
          }
        }
      }

      // Delete old TransactionHistory before creating a new one
      await TransactionHistory.destroy({
        where: { merchantTransactionId: transaction.merchantTransactionId },
        transaction: t,
      });

      // Create a new transaction history for the user
      await TransactionHistory.create(
        {
          transactionType: "paymentGateway",
          merchantUserId: transaction.merchantUserId,
          merchantTransactionId: transaction.merchantTransactionId,
          remark: `Payment Successful of amount ₹${transaction.amount}`,
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
    }

    // Handle PENDING payment status
    else if (response.data && response.data.state === "PENDING") {
      console.log(response);
      // No database changes, just return the pending status
      return res.status(200).json({
        merchantTransactionId: transaction.merchantTransactionId,
        status: "Pending",
        message: "Your request is in pending state.",
        amount: transaction.amount,
        time: transaction.time,
      });
    }

    // Handle FAILED payment case
    else {
      transaction.isVerified = true;
      transaction.status = "Failed";
      await transaction.save({ transaction: t });

      // Delete old TransactionHistory before creating a new one
      await TransactionHistory.destroy({
        where: { merchantTransactionId: transaction.merchantTransactionId },
        transaction: t,
      });

      // Create a new transaction history for failed payment
      await TransactionHistory.create(
        {
          transactionType: "paymentGateway",
          merchantUserId: transaction.merchantUserId,
          merchantTransactionId: transaction.merchantTransactionId,
          remark: `Payment Failed for transaction ${merchantTransactionId}`,
          credit: 0,
          debit: 0,
          UserId: req.user.id,
          balance: piggyBox.piggyBalance, // Get the current balance without modifying it
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
      order: [["createdAt", "DESC"]],
      limit: 10, // Assuming merchantUserId corresponds to the user's ID
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
