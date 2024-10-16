const { Sequelize } = require("sequelize");
const {
  verifyPaymentRequest,
} = require("../Controller/Users/PiggyBox/phonePayUtils");
const Piggybox = require("../Models/PiggyBox/piggyBox");
const Transaction = require("../Models/PiggyBox/transaction");
const TransactionHistory = require("../Models/PiggyBox/transactionHistory");
const sequelize = require("../database");
const User = require("../Models/User/users");
const Referrals = require("../Models/PiggyBox/referrals");
const ReferredUser = require("../Models/PiggyBox/referredUsers");
const {
  sendRewardMessage,
  sendCreditMessage,
} = require("../Utils/MailService");

exports.verifyPaymentStatus = async (merchantTransactionId, userId) => {
  let t; // Start a Sequelize transaction
  try {
    // Find the transaction by merchantTransactionId

    const user = await User.findByPk(userId);
    if (!user) {
      return;
    }

    const transaction = await Transaction.findOne({
      where: { merchantTransactionId, UserId: userId },
    });

    if (!transaction) {
      return;
    }

    // Check if the transaction is already verified
    if (transaction.isVerified) {
      return;
    }

    // Proceed to check payment status from PhonePay API
    let response = await verifyPaymentRequest(merchantTransactionId);
    response = response.data;

    // Get the user's Piggybox and update the balance
    const piggyBox = await Piggybox.findOne({
      where: { UserId: userId },
    });

    if (!piggyBox) {
      return;
    }

    // Handle COMPLETED payment
    if (response.data && response.data.state === "COMPLETED") {
      t = await sequelize.transaction();
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
        const user = await User.findByPk(userId);
        if (user.byReferallId && !user.isByReferralUsed) {
          const referral = await Referrals.findOne({
            where: { referralId: user.byReferallId },
          });

          if (referral) {
            const referringUser = await User.findByPk(referral.UserId);
            const referringPiggyBox = await Piggybox.findOne({
              where: { UserId: referringUser.id },
            });
            const rewardAmount = 800;
            if (referringPiggyBox) {
              const updatedBalance =
                parseFloat(referringPiggyBox.piggyBalance) + rewardAmount;
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
                  remark: `Referral bonus for candidateId ${user.candidateId}`,
                  credit: 800,
                  debit: 0,
                  balance: updatedBalance,
                  UserId: referringUser.id,
                },
                { transaction: t }
              );
              await user.update({ isByReferralUsed: true }, { transaction: t });
              sendRewardMessage(referringUser.phone, rewardAmount.toFixed(2));
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
      const thistory = await TransactionHistory.create(
        {
          transactionType: "paymentGateway",
          merchantUserId: transaction.merchantUserId,
          merchantTransactionId: transaction.merchantTransactionId,
          remark: `Payment Successful of amount ₹${transaction.amount}`,
          credit: transaction.amount,
          debit: 0,
          balance: newBalance,
          UserId: userId,
        },
        { transaction: t }
      );

      // Commit the transaction
      await t.commit();

      sendCreditMessage(
        user.phone,
        transaction.amount.toFixed(2),
        user.candidateId,
        `REF-35${thistory.id}`,
        piggyBox.piggyBalance.toFixed(2)
      );
      // Respond with success
      return;
    }

    // Handle PENDING payment status
    else if (response.data && response.data.state === "PENDING") {
      return;
    }

    // Handle FAILED payment case
    else {
      t = await sequelize.transaction();
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
          UserId: userId,
          balance: piggyBox.piggyBalance, // Get the current balance without modifying it
        },
        { transaction: t }
      );

      // Commit the transaction even if failed
      await t.commit();

      return;
    }
  } catch (err) {
    console.log(
      "Cron Error Reported for payment veify Status \n***********************\n"
    );
    if (t) {
      t.rollback();
    }
    console.log(err);
    return;
  }
};
