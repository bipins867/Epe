const BankDetails = require("../../../Models/PiggyBox/bankDetails");
const Piggybox = require("../../../Models/PiggyBox/piggyBox");
const RequestWithdrawal = require("../../../Models/PiggyBox/requestWithdrawal");
const TransactionHistory = require("../../../Models/PiggyBox/transactionHistory");
const AdminActivity = require("../../../Models/User/adminActivity");
const User = require("../../../Models/User/users");
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
        (req) => req.status === "Pending"
      );
      nonPendingWithdrawals = withdrawalRequests.filter(
        (req) => req.status !== "Pending"
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
      // transaction, // Use the transaction
    });

    // Check if the withdrawal request exists and is pending
    if (!withdrawalRequest) {
      return res.status(404).json({
        success: false,
        message: "Pending Withdrawal request not found.",
      });
    }
    if (withdrawalRequest.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Pending Withdrawal request not found.",
      });
    }

    // Fetch the PiggyBox associated with the user
    const piggyBox = await Piggybox.findOne({
      where: { UserId: user.id },
      //transaction,
    });

    transaction = await sequelize.transaction();
    console.log("HI");
    // Proceed based on the request status (Approved or Rejected)
    if (status === "Approved") {
      // Deduct the amount from the unclearedBalance
      const amount = parseFloat(withdrawalRequest.amount);
      piggyBox.unclearedBalance -= amount;

      // Update the withdrawal request status
      withdrawalRequest.status = "Approved";

      // Fetch the most recent TransactionHistory entry of type 'withdrawal'
      const recentWithdrawalTransaction = await TransactionHistory.findOne({
        where: { UserId: user.id, transactionType: "withdrawal" },
        order: [["createdAt", "DESC"]], // Get the most recent transaction
        //transaction, // Use the transaction
      });

      // Update the remark of the most recent transaction
      if (recentWithdrawalTransaction) {
        recentWithdrawalTransaction.remark =
          "User withdrawal request approved by Admin";
        await recentWithdrawalTransaction.save({ transaction });
      }

      // Create a new TransactionHistory entry for the current withdrawal request

      const transactionHistory = await TransactionHistory.findOne({
        where: { UserId: user.id, transactionType: "withdrawal" },
        order: [["createdAt", "DESC"]],
      });
      transactionHistory.remark = "	User withdrawal request approved by Admin";

      await transactionHistory.update({ transaction });
    } else if (status === "Rejected") {
      // Add the amount back to the piggyBalance
      const amount = parseFloat(withdrawalRequest.amount);
      piggyBox.unclearedBalance -= amount; // Deduct from unclearedBalance
      piggyBox.piggyBalance += amount; // Add to piggyBalance

      // Create a TransactionHistory entry for rejection
      await TransactionHistory.create(
        {
          transactionType: "withdrawal",
          remark: "User withdrawal rejected",
          debit: 0,
          credit: amount,
          balance: piggyBox.piggyBalance, // Updated balance
          UserId: user.id,
        },
        { transaction }
      );
      console.log("HI THERE");
      // Update the withdrawal request status
      withdrawalRequest.status = "Rejected";
      withdrawalRequest.adminRemark = adminRemark;
      withdrawalRequest.userRemark = `Admin :- ${adminRemark}`;
    }

    // Save changes to the database
    await Promise.all([
      withdrawalRequest.save({ transaction }), // Save the updated withdrawal request
      piggyBox.save({ transaction }), // Save the updated piggyBox
    ]);

    // Commit the transaction
    await transaction.commit();

    // Send a successful response
    res.status(200).json({
      success: true,
      message: `Withdrawal request ${status.toLowerCase()} successfully.`,
    });
  } catch (error) {
    // Rollback transaction in case of error
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
