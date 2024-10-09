const Piggybox = require("../Models/PiggyBox/piggyBox");
const TransactionHistory = require("../Models/PiggyBox/transactionHistory");
const User = require("../Models/User/users");
const { Sequelize } = require("sequelize");
const sequelize = require("../database");
const { sendCreditMessage } = require("../Utils/MailService");

// Daily PiggyBox Interest Balance Update
exports.dailyPiggyBoxInterestBalanceUpdate = async (userId) => {
  try {
    // Fetch user
    const user = await User.findByPk(userId);
    if (!user || !user.isActive) {
      return; // Return if the user doesn't exist
    }

    // Fetch the user's Piggybox
    const piggybox = await Piggybox.findOne({ where: { userId: user.id } });
    if (!piggybox) {
      return; // Return if the Piggybox doesn't exist
    }

    if (!piggybox.isFundedFirst) {
      return;
    }
    // Parse float values for calculation
    let piggyBalance = parseFloat(piggybox.piggyBalance);
    let interestBalance = parseFloat(piggybox.interestBalance);

    // Calculate interest using the given formula
    const newInterest = piggyBalance * 0.12 * 0.0027397260273;

    // Update interest balance
    interestBalance += newInterest;

    // Update the Piggybox with new interest balance
    piggybox.interestBalance = interestBalance;
    await piggybox.save();
  } catch (error) {
    console.error("Error in dailyPiggyBoxInterestBalanceUpdate:", error);
  }
};

// Add Monthly Interest Balance to Piggybox
exports.addMonthlyInterestBalanceToPiggyBox = async (userId) => {
  let transaction;
  try {
    // Fetch user
    const user = await User.findByPk(userId);
    if (!user || !user.isActive) {
      return; // Return if the user doesn't exist || not active..
    }

    // Fetch the user's Piggybox
    const piggybox = await Piggybox.findOne({
      where: { userId: user.id },
    });
    if (!piggybox) {
      return; // Return if the Piggybox doesn't exist
    }
    if (!piggybox.isFundedFirst) {
      return;
    }
    // Parse float values
    let piggyBalance = parseFloat(piggybox.piggyBalance);
    let interestBalance = parseFloat(piggybox.interestBalance);

    if (interestBalance < 1) {
      return;
    }
    // Add interest balance to piggy balance
    piggyBalance += interestBalance;
    transaction = await sequelize.transaction();
    // Create Transaction History for monthly interest
    await TransactionHistory.create(
      {
        transactionType: "interest",
        remark: "Monthly interest credited",
        credit: interestBalance,
        balance: piggyBalance,
        UserId: userId,
      },
      { transaction }
    );

    // Update Piggybox balances
    piggybox.piggyBalance = piggyBalance;
    piggybox.interestBalance = 0; // Reset interest balance
    await piggybox.save({ transaction });

    // Commit the transaction
    await transaction.commit();

    sendCreditMessage(
      user.phone,
      interestBalance.toFixed(2),
      user.candidateId,
      "interest",
      piggyBalance.toFixed(2)
    );
  } catch (error) {
    // Rollback the transaction in case of error
    if (transaction) {
      await transaction.rollback();
    }
    console.error("Error in addMonthlyInterestBalanceToPiggyBox:", error);
  }
};
