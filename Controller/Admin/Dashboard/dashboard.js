const Piggybox = require("../../../Models/PiggyBox/piggyBox");
const RequestWithdrawal = require("../../../Models/PiggyBox/requestWithdrawal");
const Transaction = require("../../../Models/PiggyBox/transaction");
const TransactionHistory = require("../../../Models/PiggyBox/transactionHistory");
const User = require("../../../Models/User/users");
const { Op } = require("sequelize");

exports.getDashboardInfo = async (req, res, next) => {
  const admin = req.admin;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to start of the day

    // Basic admin info
    const adminInfo = {
      userName: admin.userName,
      adminType: admin.adminType,
      name: admin.name,
    };

    // Fetch total customers
    const totalCustomers = await User.findAll({
      attributes: { exclude: ["password"] },
    });

    // Fetch today's joined customers
    const todaysJoinCustomers = await User.findAll({
      where: {
        createdAt: {
          [Op.gte]: today, // Users created today
        },
      },
      attributes: { exclude: ["password"] },
    });

    // Fetch total wallet recharge for today (successful transactions)
    const walletRechargeToday = await Transaction.sum("amount", {
      where: {
        status: "Successful", // Transactions that are marked as successful
        time: {
          [Op.gte]: today, // Transactions created today
        },
      },
    });

    // Sum of all users' PiggyBox piggyBalance
    const totalWalletBalance = await Piggybox.sum("piggyBalance");

    // Sum of all users' PiggyBox unclearedBalance
    const totalUnclearedBalance = await Piggybox.sum("unclearedBalance");

    // Sum of all users' PiggyBox interestBalance
    const totalInterestBalance = await Piggybox.sum("interestBalance");

    // Fetch pending withdrawal requests
    const pendingWithdrawals = await RequestWithdrawal.findAll({
      where: { status: "pending" },
    });

    // Fetch pending account closure requests
    const pendingAccountClosureRequests = await User.findAll({
      where: { isRequestedClouser: true },
      attributes: { exclude: ["password"] },
    });

    // Fetch 20 recent join users
    const recentJoinedUsers = await User.findAll({
      limit: 20,
      order: [["createdAt", "DESC"]],
      attributes: { exclude: ["password"] },
    });

    // Compile the dashboard info object
    const dashboardInfo = {
      adminInfo,
      totalCustomers: totalCustomers.length,
      todaysJoinCustomers,
      walletRechargeToday: walletRechargeToday || 0, // Fallback to 0 if null
      totalWalletBalance: totalWalletBalance || 0,
      totalUnclearedBalance: totalUnclearedBalance || 0,
      totalInterestBalance: totalInterestBalance || 0,
      pendingWithdrawals,
      pendingAccountClosureRequests,
      recentJoinedUsers,
    };

    // Send a successful response with the admin and dashboard info
    res.status(200).json({ dashboardInfo });
  } catch (err) {
    console.error("Error during admin dashboard info retrieval:", err);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};

exports.getRecentUserList = async (req, res, next) => {};
