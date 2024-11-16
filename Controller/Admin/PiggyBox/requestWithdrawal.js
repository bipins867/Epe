const UserKyc = require("../../../Models/Kyc/userKyc");
const BankDetails = require("../../../Models/PiggyBox/bankDetails");
const Piggybox = require("../../../Models/PiggyBox/piggyBox");
const RequestWithdrawal = require("../../../Models/PiggyBox/requestWithdrawal");
const TransactionHistory = require("../../../Models/PiggyBox/transactionHistory");
const User = require("../../../Models/User/users");
const { sendDebitMessage } = require("../../../Utils/MailService");
const {
  createAdminActivity,
  createUserActivity,
} = require("../../../Utils/activityUtils");
const sequelize = require("../../../database");
const Sequelize = require("sequelize");

//Status will be passed based no the situation like -> pending /  non pendings
exports.getWithdrawalRequestList = async (req, res, next) => {
  try {
    // Extract status, fromDate, and toDate from the request body
    const { status, fromDate, toDate } = req.body;

    // Define the where condition for the request withdrawal query
    let whereCondition = {};

    // Add the status condition if provided
    if (status) {
      // If status is 'pending', fetch only pending requests
      if (status === "pending") {
        whereCondition.status = "pending";
      }
      // Otherwise, fetch all except pending requests
      else {
        whereCondition.status = { [Sequelize.Op.ne]: "pending" };
      }
    }

    // Add date range condition if both fromDate and toDate are provided
    if (fromDate && toDate) {
      whereCondition.createdAt = {
        [Sequelize.Op.between]: [new Date(fromDate), new Date(toDate)],
      };
    }

    // Fetch the withdrawal requests based on the conditions, ensuring the associated user's isRequestedClouser is false
    const withdrawalRequests = await RequestWithdrawal.findAll({
      where: whereCondition,
      order: [["createdAt", "ASC"]], // Orders the results by creation date (earliest first)
      include: [
        {
          model: User,
          attributes: ["id", "name", "candidateId", "email", "phone"],
          where: { isRequestedClouser: false }, // Filter users whose isRequestedClouser is false
        },
      ],
      limit: 20, // Limiting to top 20 requests, adjust this limit as needed
    });

    // If no requests found, send a 404 response
    if (withdrawalRequests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No withdrawal requests found !",
      });
    }

    // Send the list of withdrawal requests in the response
    res.status(200).json({
      success: true,
      data: withdrawalRequests,
    });
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching withdrawal requests.",
    });
  }
};

//Get request withdrwal related user information
exports.getCustomerInformation = async (req, res, next) => {
  try {
    // Extract candidateId from the request body or params
    const { candidateId } = req.body;

    // Fetch the user based on the candidateId
    const user = await User.findOne({
      where: { candidateId },
      attributes: [
        "id",
        "candidateId",
        "name",
        "email",
        "phone",
        "isRequestedClouser",
      ], // Select only the needed fields
    });

    // If user not found, return a 404 error
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Fetch PiggyBox details for the user
    const piggyBox = await Piggybox.findOne({
      where: { UserId: user.id },
      attributes: ["piggyBalance", "unclearedBalance", "interestBalance"], // Return relevant piggyBox details
    });

    const userKyc = await UserKyc.findOne({ where: { UserId: user.id } });
    // Fetch BankDetails for the user
    const bankDetails = await BankDetails.findOne({
      where: { UserId: user.id },
      attributes: [
        "accountNumber",
        "ifscCode",
        "bankName",
        "accountHolderName",
      ], // Return relevant bankDetails fields
    });

    // Initialize the list for non-pending withdrawal requests
    let pendingWithdrawals = [];
    let nonPendingWithdrawals = [];

    // If the user has not requested closure, fetch both pending and non-pending withdrawal requests
    if (!user.isRequestedClouser) {
      // Fetch all withdrawal requests for the user
      const withdrawalRequests = await RequestWithdrawal.findAll({
        where: { UserId: user.id },
        order: [["createdAt", "DESC"]], // Order by the most recent requests
        // Select the needed fields
      });

      // Separate pending and non-pending requests
      pendingWithdrawals = withdrawalRequests.filter(
        (req) => req.status === "pending"
      );
      nonPendingWithdrawals = withdrawalRequests.filter(
        (req) => req.status !== "pending"
      );
    }
    // If user requested closure, only return non-pending withdrawal requests
    else {
      nonPendingWithdrawals = await RequestWithdrawal.findAll({
        where: { UserId: user.id, status: { [Sequelize.Op.ne]: "pending" } }, // Only non-pending requests
        order: [["createdAt", "DESC"]],
      });
    }

    // Prepare the response object
    const response = {
      success: true,
      user: {
        candidateId: user.candidateId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        kycStatus: userKyc ? userKyc.userAggreementAccepted : false,
      },
      piggyBox, // Return PiggyBox info
      bankDetails, // Return BankDetails info
      withdrawals: {
        pending: pendingWithdrawals, // Return pending withdrawal requests (if applicable)
        nonPending: nonPendingWithdrawals, // Return non-pending withdrawal requests
      },
    };

    // Send the response
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching customer information:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching customer information.",
    });
  }
};

//Status update --
exports.updateCustomerWithdrawalStatus = async (req, res, next) => {
  
  const { candidateId, status, adminRemark, requestId } = req.body;

  let transaction; // Start a new transaction

  try {
    // Fetch the user based on candidateId
    const user = await User.findOne({ where: { candidateId } });

    // Check if the user exists
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Check user status conditions
    if (user.isBlocked) {
      return res
        .status(403)
        .json({ success: false, message: "User account is blocked." });
    }
    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "User account is inactive." });
    }
    if (user.isRequestedClouser) {
      return res.status(403).json({
        success: false,
        message:
          "User has requested account closure. Cannot process withdrawal.",
      });
    }

    // Fetch the withdrawal request by requestId
    const withdrawalRequest = await RequestWithdrawal.findOne({
      where: { requestId: requestId, UserId: user.id },
    });

    // Check if the withdrawal request exists
    if (!withdrawalRequest) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal request not found.",
      });
    }
    if (
      withdrawalRequest.status !== "pending" &&
      withdrawalRequest.status !== "locked"
    ) {
      return res.status(400).json({
        success: false,
        message: "Withdrawal request not in a modifiable state.",
      });
    }

    // Fetch the PiggyBox associated with the user
    const piggyBox = await Piggybox.findOne({
      where: { UserId: user.id },
    });

    transaction = await sequelize.transaction();

    // Proceed based on the request status (Approved, Rejected, or Locked)
    if (status === "Approved") {
      const amount = parseFloat(withdrawalRequest.amount);
      piggyBox.unclearedBalance -= amount;

      withdrawalRequest.status = "Approved";

      // Update the most recent transaction
      const recentWithdrawalTransaction = await TransactionHistory.findOne({
        where: { UserId: user.id, transactionType: "withdrawal" },
        order: [["createdAt", "DESC"]],
      });

      if (recentWithdrawalTransaction) {
        recentWithdrawalTransaction.remark =
          "User withdrawal request approved by Admin";
        await recentWithdrawalTransaction.save({ transaction });
      }

      await createAdminActivity(
        req,
        req.admin,
        "requestWithdrawal",
        `Approved withdrawal request for user ${
          user.candidateId
        }. Amount: ${amount.toFixed(2)}. Admin Remark: ${adminRemark}`,
        user.candidateId,
        transaction
      );

      await createUserActivity(
        null,
        user,
        "adminUpdate",
        `Withdrawal request approved. Amount: ${amount.toFixed(2)}. By Admin: ${
          req.admin.userName
        }`,
        transaction
      );

      sendDebitMessage(
        user.phone,
        amount.toFixed(2),
        user.candidateId,
        `WID-35${recentWithdrawalTransaction?.id}`,
        piggyBox.piggyBalance.toFixed(2)
      );
    } else if (status === "Rejected") {
      const amount = parseFloat(withdrawalRequest.amount);
      piggyBox.unclearedBalance -= amount;
      piggyBox.piggyBalance += amount;

      await TransactionHistory.create(
        {
          transactionType: "withdrawal",
          remark: "User withdrawal rejected",
          debit: 0,
          credit: amount,
          balance: piggyBox.piggyBalance,
          UserId: user.id,
        },
        { transaction }
      );

      withdrawalRequest.status = "Rejected";
      withdrawalRequest.adminRemark = adminRemark;
      withdrawalRequest.userRemark = `Admin: ${adminRemark}`;

      await createAdminActivity(
        req,
        req.admin,
        "requestWithdrawal",
        `Rejected withdrawal request for user ${
          user.candidateId
        }. Amount: ${amount.toFixed(2)}. Admin Remark: ${adminRemark}`,
        user.candidateId,
        transaction
      );

      await createUserActivity(
        null,
        user,
        "adminUpdate",
        `Withdrawal request rejected. Amount: ${amount.toFixed(2)}. By Admin: ${
          req.admin.userName
        }. Admin Remark: ${adminRemark}`,
        transaction
      );
    } else if (status === "Locked") {
      withdrawalRequest.status = "Locked";
      withdrawalRequest.adminRemark = adminRemark;

      await createAdminActivity(
        req,
        req.admin,
        "requestWithdrawal",
        `Locked withdrawal request for user ${user.candidateId}. Admin Remark: ${adminRemark}`,
        user.candidateId,
        transaction
      );
    }

    // Save changes to the database
    await Promise.all([
      withdrawalRequest.save({ transaction }),
      piggyBox.save({ transaction }),
    ]);

    // Commit the transaction
    await transaction.commit();

    // Send a successful response
    res.status(200).json({
      success: true,
      message: `Withdrawal request ${status.toLowerCase()} successfully.`,
    });
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    console.error("Error processing withdrawal request:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing withdrawal request.",
    });
  }
};

exports.lockPendingWithdrawalRequests = async (req, res, next) => {
  let transaction;

  try {
    // Fetch all pending withdrawal requests
    const pendingWithdrawals = await RequestWithdrawal.findAll({
      where: { status: "Pending" },
    });

    // If no pending withdrawals, return a response
    if (pendingWithdrawals.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No pending withdrawal requests found to lock.",
      });
    }

    transaction = await sequelize.transaction();
    // Update the status of all pending withdrawals to "Locked"
    await Promise.all(
      pendingWithdrawals.map(async (withdrawal) => {
        withdrawal.status = "Locked";
        await withdrawal.save({ transaction });

        // Create an admin activity for each locked request
        await createAdminActivity(
          req,
          req.admin,
          "requestWithdrawal",
          `Locked withdrawal request for user ${withdrawal.UserId}. Request ID: ${withdrawal.requestId}`,
          withdrawal.UserId,
          transaction
        );
      })
    );

    // Commit the transaction
    await transaction.commit();

    // Send success response
    res.status(200).json({
      success: true,
      message: `${pendingWithdrawals.length} pending withdrawal requests locked successfully.`,
    });
  } catch (error) {
    // Rollback the transaction in case of errors
    if (transaction) {
      await transaction.rollback();
    }

    console.error("Error locking pending withdrawal requests:", error);

    res.status(500).json({
      success: false,
      message: "Server error while locking pending withdrawal requests.",
    });
  }
};
