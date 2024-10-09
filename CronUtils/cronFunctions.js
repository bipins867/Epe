const { Sequelize } = require("sequelize");
const Transaction = require("../Models/PiggyBox/transaction");
const User = require("../Models/User/users");

const { verifyPaymentStatus } = require("./paymentUtils");
const {
  dailyPiggyBoxInterestBalanceUpdate,
  addMonthlyInterestBalanceToPiggyBox,
} = require("./piggyBoxUtils");

exports.paymentVerifier = async () => {
  try {
    // Get the current time and calculate 1 hour ago
    const currentTime = new Date();
    const oneHourAgo = new Date(currentTime.getTime() - 60 * 60 * 1000);

    // Fetch all transactions with status 'Pending' created before 1 hour ago
    const pendingTransactions = await Transaction.findAll({
      where: {
        status: "Pending",
        time: { [Sequelize.Op.lt]: oneHourAgo },
      },
    });

    // For each pending transaction, verify payment status
    for (const transaction of pendingTransactions) {
      await verifyPaymentStatus(
        transaction.merchantTransactionId,
        transaction.merchantUserId
      );
    }
  } catch (err) {
    console.error("Error in paymentVerifier:", err);
  }
};
exports.dailyInterestAdder = async () => {
  try {
    // Fetch all active users
    const activeUsers = await User.findAll({
      where: { isActive: true },
    });

    // For each active user, update daily interest balance
    for (const user of activeUsers) {
      await dailyPiggyBoxInterestBalanceUpdate(user.id);
    }
  } catch (err) {
    console.error("Error in dailyInterestAdder:", err);
  }
};

exports.monthlyInterestBalanceUpdater = async () => {
  try {
    // Fetch all active users
    const activeUsers = await User.findAll({
      where: { isActive: true },
    });

    // For each active user, update the monthly interest balance
    for (const user of activeUsers) {
      await addMonthlyInterestBalanceToPiggyBox(user.id);
    }
  } catch (err) {
    console.error("Error in monthlyInterestBalanceUpdater:", err);
  }
};

