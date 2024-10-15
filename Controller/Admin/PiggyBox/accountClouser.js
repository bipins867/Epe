const UserKyc = require("../../../Models/Kyc/userKyc");
const BankDetails = require("../../../Models/PiggyBox/bankDetails");
const Piggybox = require("../../../Models/PiggyBox/piggyBox");
const RequestWithdrawal = require("../../../Models/PiggyBox/requestWithdrawal");
const SavedAddress = require("../../../Models/PiggyBox/savedAddress");
const TransactionHistory = require("../../../Models/PiggyBox/transactionHistory");
const AdminActivity = require("../../../Models/User/adminActivity");
const User = require("../../../Models/User/users");
const sequelize = require("../../../database");
const Sequelize = require("sequelize");

exports.getPendingClosureRequestList = async (req, res, next) => {
  try {
    const { candidateId } = req.body; // Get candidateId from request body

    // Build the query options
    const queryOptions = {
      where: {
        isRequestedClouser: true,
      },
      attributes: { exclude: ["password"] }, // Exclude password field from the result
    };

    // If candidateId is provided, filter by it
    if (candidateId) {
      queryOptions.where.candidateId = candidateId;
    }

    // Fetch users based on query options
    console.log(queryOptions);
    const users = await User.findAll(queryOptions);

    // Check if any users found
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No pending closure requests found.",
      });
    }

    // Send the response with the list of users
    res.status(200).json({
      success: true,
      message: "Pending closure requests retrieved successfully.",
      users,
    });
  } catch (error) {
    console.error("Error fetching pending closure requests:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching pending closure requests.",
    });
  }
};

exports.getHistoryOfClosureRequestList = async (req, res, next) => {
  try {
    const { candidateId } = req.body; // Get candidateId from request body

    // Build the query options
    const queryOptions = {
      where: {
        isActive: false,
      },
      attributes: { exclude: ["password"] }, // Exclude password field from the result
    };

    // If candidateId is provided, filter by it
    if (candidateId) {
      queryOptions.where.candidateId = candidateId;
    }

    // Fetch users based on query options
    const users = await User.findAll(queryOptions);

    // Check if any users found
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No history of closure requests found.",
      });
    }

    // Send the response with the list of users
    res.status(200).json({
      success: true,
      message: "History of closure requests retrieved successfully.",
      users,
    });
  } catch (error) {
    console.error("Error fetching history of closure requests:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching history of closure requests.",
    });
  }
};

exports.getCustomerInformation = async (req, res, next) => {
  try {
    // Extract candidateId from the request body
    const { candidateId } = req.body;

    // Fetch the user based on candidateId
    const user = await User.findOne({
      where: { candidateId },
      attributes: { exclude: ["password"] }, // Exclude password for security reasons
    });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Fetch the associated PiggyBox information
    const piggyBox = await Piggybox.findOne({
      where: { UserId: user.id },
    });

    // Fetch the associated BankDetails information
    const bankDetails = await BankDetails.findOne({
      where: { UserId: user.id },
    });

    // Fetch the associated SavedAddress information
    const savedAddress = await SavedAddress.findOne({
      where: { UserId: user.id },
    });

    const userKyc = await UserKyc.findOne({
      where: { UserId: user.id },
    });

    // Fetch the withdrawal history in two parts: pending and non-pending
    const pendingWithdrawals = await RequestWithdrawal.findAll({
      where: {
        UserId: user.id,
        status: "pending",
      },
      order: [["createdAt", "DESC"]], // Order by the most recent requests
    });

    const nonPendingWithdrawals = await RequestWithdrawal.findAll({
      where: {
        UserId: user.id,
        status: { [Sequelize.Op.ne]: "pending" }, // Fetch all statuses except pending
      },
      order: [["createdAt", "DESC"]],
    });

    // Return the response with all the fetched information
    res.status(200).json({
      success: true,
      kycStatus: userKyc ? userKyc.userAggrementAccepted : false,
      userInformation: user, // User's personal information
      piggyBoxInformation: piggyBox || {}, // PiggyBox info or empty if not found
      bankDetailsInformation: bankDetails || {}, // Bank details or empty if not found
      savedAddressInformation: savedAddress || {}, // Saved address or empty if not found
      withdrawalHistory: {
        pending: pendingWithdrawals, // List of pending withdrawals
        nonPending: nonPendingWithdrawals, // List of approved/rejected withdrawals
      },
    });
  } catch (error) {
    console.error("Error fetching customer information:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching customer information.",
    });
  }
};

exports.approveCustomerClouserRequest = async (req, res, next) => {
  let transaction;
  try {
    const { candidateId } = req.body;

    // Fetch the user based on candidateId
    const user = await User.findOne({
      where: { candidateId },
      //transaction,
    });

    // Check if the user exists
    if (!user) {
      //await transaction.rollback();
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Check if the user is blocked, inactive, or not requested closure
    if (user.isBlocked) {
      //await transaction.rollback();
      return res
        .status(403)
        .json({ success: false, message: "User is blocked." });
    }
    if (!user.isActive) {
      //await transaction.rollback();
      return res
        .status(400)
        .json({ success: false, message: "User is already inactive." });
    }
    if (!user.isRequestedClouser) {
      //await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "User has not requested account closure.",
      });
    }

    // Fetch the user's PiggyBox
    const piggyBox = await Piggybox.findOne({
      where: { UserId: user.id },
      //  transaction,
    });

    // Fetch the recent pending withdrawal request
    const withdrawalRequest = await RequestWithdrawal.findOne({
      where: {
        UserId: user.id,
        status: "pending",
      },
      order: [["createdAt", "DESC"]],
      // transaction,
    });

    if (!withdrawalRequest) {
      //await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "No pending withdrawal request found.",
      });
    }
    // Start a Sequelize transaction
    transaction = await sequelize.transaction();

    // Update the user status
    
    // Check if the user has a referral and hasn't used it yet
    if (!user.isFundedFirst && user.byReferralId) {
      user.isByReferralUsed = true; // Mark referral as used
    }
    user.isActive = false; // Mark the user as inactive
    user.isRequestedClouser = false; // Reset closure request

    await user.save({ transaction });

    // Deduct the withdrawal amount from unclearedBalance
    const withdrawalAmount = parseFloat(withdrawalRequest.amount);
    piggyBox.unclearedBalance -= withdrawalAmount;
    await piggyBox.save({ transaction });

    // Approve the withdrawal request
    withdrawalRequest.status = "Approved";
    await withdrawalRequest.save({ transaction });

    // Fetch the most recent TransactionHistory with transactionType "accountClosure"
    const recentTransactionHistory = await TransactionHistory.findOne({
      where: {
        UserId: user.id,
        transactionType: "accountClosure",
      },
      order: [["createdAt", "DESC"]],
      //transaction,
    });

    // Update the transaction history remark
    if (recentTransactionHistory) {
      recentTransactionHistory.remark =
        "Request for account closure accepted by Admin.";
      await recentTransactionHistory.save({ transaction });
    }

    // Commit the transaction
    await transaction.commit();

    // Send a success response
    res.status(200).json({
      success: true,
      message: "User account closure request approved successfully.",
    });
  } catch (error) {
    // Rollback the transaction on error
    if (transaction) {
      await transaction.rollback();
    }

    console.error("Error approving account closure request:", error);
    res.status(500).json({
      success: false,
      message: "Server error while approving account closure request.",
    });
  }
};

exports.rejectCustomerClouserRequest = async (req, res, next) => {
  let transaction;
  try {
    const { candidateId, adminRemark } = req.body;

    // Fetch the user based on candidateId
    const user = await User.findOne({
      where: { candidateId },
      //transaction,
    });

    // Check if the user exists
    if (!user) {
      //await transaction.rollback();
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Check if the user is blocked, inactive, or not requested closure
    if (user.isBlocked) {
      //await transaction.rollback();
      return res
        .status(403)
        .json({ success: false, message: "User is blocked." });
    }
    if (!user.isActive) {
      //await transaction.rollback();
      return res
        .status(400)
        .json({ success: false, message: "User is already inactive." });
    }
    if (!user.isRequestedClouser) {
      //await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "User has not requested account closure.",
      });
    }

    // Fetch the user's PiggyBox
    const piggyBox = await Piggybox.findOne({
      where: { UserId: user.id },
      //transaction,
    });

    // Fetch the recent pending withdrawal request
    const withdrawalRequest = await RequestWithdrawal.findOne({
      where: {
        UserId: user.id,
        status: "pending",
      },
      order: [["createdAt", "DESC"]],
      //transaction,
    });

    if (!withdrawalRequest) {
      //await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "No pending withdrawal request found.",
      });
    }

    // Start a Sequelize transaction
    transaction = await sequelize.transaction();

    // Deduct the withdrawal amount from unclearedBalance and add it back to piggyBalance
    const withdrawalAmount = parseFloat(withdrawalRequest.amount);
    piggyBox.unclearedBalance -= withdrawalAmount;
    piggyBox.piggyBalance += withdrawalAmount;
    await piggyBox.save({ transaction });

    // Update the withdrawal request status to 'Rejected'
    withdrawalRequest.status = "Rejected";
    withdrawalRequest.remark = `Admin: ${adminRemark}`;
    await withdrawalRequest.save({ transaction });

    // Create a new TransactionHistory entry for account closure rejection
    await TransactionHistory.create(
      {
        transactionType: "accountClosure",
        remark: `Account closure request rejected by Admin: ${adminRemark}`,
        debit: 0,
        credit: withdrawalAmount,
        balance: piggyBox.piggyBalance, // Updated balance after adding the amount back
        UserId: user.id,
      },
      { transaction }
    );

    user.isActive = true; // Mark the user as inactive
    user.isRequestedClouser = false; // Reset closure request
    user.adminRemark=adminRemark;
    
    await user.save({ transaction });

    // Commit the transaction
    await transaction.commit();

    // Send a success response
    res.status(200).json({
      success: true,
      message: "User account closure request rejected successfully.",
      data: {
        newBalance: piggyBox.piggyBalance, // Send the updated balance
      },
    });
  } catch (error) {
    // Rollback the transaction on error
    if (transaction) await transaction.rollback();

    console.error("Error rejecting account closure request:", error);
    res.status(500).json({
      success: false,
      message: "Server error while rejecting account closure request.",
    });
  }
};
