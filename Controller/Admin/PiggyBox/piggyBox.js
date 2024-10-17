const User = require("../../../Models/User/users");
const Piggybox = require("../../../Models/PiggyBox/piggyBox");
const sequelize = require("../../../database");
const BankDetails = require("../../../Models/PiggyBox/bankDetails");
const TransactionHistory = require("../../../Models/PiggyBox/transactionHistory");
const { Op } = require("sequelize"); // Sequelize operator for date filtering
const { sendDebitMessage, sendCreditMessage } = require("../../../Utils/MailService");
const { createUserActivity, createAdminActivity } = require("../../../Utils/activityUtils");

exports.getSearchCustomerResult = async (req, res, next) => {
  try {
    // Extract candidateId from query parameters
    const { candidateId } = req.body;

    // Validate candidateId
    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: "Candidate ID is required",
      });
    }

    // Fetch user information based on candidateId
    const users = await User.findAll({
      where: {
        candidateId: candidateId, // Assuming candidateId is unique
      },
      attributes: ["id", "name", "candidateId", "createdAt"], // Specify the fields you want to return
    });

    // Check if user is found
    if (!users) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return the user information in the response
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user information",
      error: error.message,
    });
  }
};

exports.getCustomersList = async (req, res, next) => {
  try {
    // Extract query parameters
    const { fromDate, toDate, limit } = req.body;

    // Default limit if none is provided
    const resultsLimit = limit ? parseInt(limit) : 20;

    // Initialize query options
    let queryOptions = {
      limit: resultsLimit,
      order: [["createdAt", "DESC"]], // Order by creation date (newest first)
      attributes: ["id", "name", "candidateId", "createdAt"], // Select fields to return
    };

    // If fromDate and toDate are provided, filter the users based on the date range
    if (fromDate && toDate) {
      queryOptions.where = {
        createdAt: {
          [Op.between]: [new Date(fromDate), new Date(toDate)], // Filter users by creation date range
        },
      };
    }

    // Fetch users based on the query options
    const customers = await User.findAll(queryOptions);

    // Return the customers in the response
    res.status(200).json({
      success: true,
      customers,
    });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message,
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
      attributes: { exclude: ["password"] }, // Exclude password from the response
    });

    // Check if the user exists
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Fetch the PiggyBox associated with the user
    const piggyBox = await Piggybox.findOne({ where: { UserId: user.id } });

    // Fetch the BankDetails associated with the user
    const bankDetails = await BankDetails.findOne({
      where: { UserId: user.id },
    });

    // Prepare the response data
    const responseData = {
      user,
      piggyBox,
      bankDetails,
    };

    // Send the customer information in the response
    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching customer information:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching customer information.",
    });
  }
};

exports.getCustomerTopRecentTransactionHistory = async (req, res, next) => {
  try {
    // Extract candidateId, fromDate, toDate, and limit from the request body
    const { candidateId, fromDate, toDate, limit } = req.body;
    //console.log(req.body);
    // Fetch the user based on candidateId
    const user = await User.findOne({
      where: { candidateId },
    });

    // Check if the user exists
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Prepare the query for transaction history
    const query = {
      where: { UserId: user.id }, // Assuming UserId is the foreign key in TransactionHistory
      order: [
        ["createdAt", "DESC"],
        ["id", "DESC"],
      ], // Order by creation date (most recent first)
    };

    // Add date filters if provided
    if (fromDate) {
      query.where.createdAt = { [Op.gte]: new Date(fromDate) };
    }
    if (toDate) {
      query.where.createdAt = { [Op.lte]: new Date(toDate) };
    }

    // Set the limit if provided, otherwise use the default of 20
    query.limit = limit ? parseInt(limit, 10) : 20;

    // Fetch the user's transaction history
    const transactionHistories = await TransactionHistory.findAll(query);

    // Send the list of transaction histories in the response
    res.status(200).json({
      success: true,
      transactionHistories,
    });
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching transaction history.",
    });
  }
};

exports.addFundsToCustomerWallet = async (req, res, next) => {
  let transaction;
  try {
    // Extract candidateId and amount from the request body
    const { candidateId, amount, remark } = req.body;

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount provided." });
    }

    // Fetch the user based on candidateId
    const user = await User.findOne({
      where: { candidateId },
    });

    // Check if the user exists
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Fetch the user's PiggyBox
    const piggyBox = await Piggybox.findOne({
      where: { UserId: user.id },
    });

    // Check if the PiggyBox exists
    if (!piggyBox) {
      return res
        .status(404)
        .json({ success: false, message: "PiggyBox not found for the user." });
    }

    // Parse the amount
    const parsedAmount = parseFloat(amount);

    // Start the transaction
    transaction = await sequelize.transaction();

    // Add the amount to piggyBalance
    piggyBox.piggyBalance += parsedAmount;

    // Update the PiggyBox
    await piggyBox.save({ transaction });

    // Create a TransactionHistory entry
    const thistory = await TransactionHistory.create(
      {
        transactionType: "adminUpdate",
        remark: `Admin added funds of amount: ${parsedAmount}`,
        debit: 0,
        credit: parsedAmount,
        balance: piggyBox.piggyBalance, // Updated balance after addition
        UserId: user.id,
      },
      { transaction }
    );

    // Log Admin Activity
    await createAdminActivity(
      req,
      req.admin, // Assuming req.admin contains the admin's details
      "piggyBox",
      `Admin ${req.admin.userName} added ${parsedAmount} to user ${user.candidateId}'s wallet. Admin remark: ${remark}`,
      user.candidateId,
      transaction
    );

    // Log User Activity
    await createUserActivity(
      null, // Assuming this action is initiated by the admin
      user,
      "adminUpdate",
      `Funds of amount ${parsedAmount} added to your wallet by admin. Admin remark: ${remark}`,
      transaction
    );

    // Commit the transaction
    await transaction.commit();

    // Send a confirmation message to the user
    sendCreditMessage(
      user.phone,
      parsedAmount.toFixed(2),
      user.candidateId,
      `ADM-35${thistory.id}`,
      piggyBox.piggyBalance.toFixed(2)
    );

    // Send a success response
    res.status(200).json({
      success: true,
      message: "Funds added successfully to the customer wallet.",
      data: {
        newBalance: piggyBox.piggyBalance, // Send the updated balance
      },
    });
  } catch (error) {
    // Rollback the transaction on error
    console.error("Error adding funds to customer wallet:", error);
    if (transaction) {
      await transaction.rollback();
    }
    res.status(500).json({
      success: false,
      message: "Server error while adding funds to the customer wallet.",
    });
  }
};


exports.deductFundsFromCustomerWallet = async (req, res, next) => {
  let transaction;
  try {
    // Extract candidateId and amount from the request body
    const { candidateId, amount, remark } = req.body;

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount provided." });
    }

    // Fetch the user based on candidateId
    const user = await User.findOne({
      where: { candidateId },
    });

    // Check if the user exists
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Fetch the user's PiggyBox
    const piggyBox = await Piggybox.findOne({
      where: { UserId: user.id },
    });

    // Check if the PiggyBox exists
    if (!piggyBox) {
      return res
        .status(404)
        .json({ success: false, message: "PiggyBox not found for the user." });
    }

    // Parse the amount
    const parsedAmount = parseFloat(amount);

    // Check if there are sufficient funds to deduct
    if (piggyBox.piggyBalance < parsedAmount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient funds in the piggy box.",
      });
    }

    // Start a Sequelize transaction
    transaction = await sequelize.transaction();

    // Deduct the amount from piggyBalance
    piggyBox.piggyBalance -= parsedAmount;

    // Update the PiggyBox
    await piggyBox.save({ transaction });

    // Create a TransactionHistory entry
    const thistory = await TransactionHistory.create(
      {
        transactionType: "adminUpdate",
        remark: `Admin is deducting funds of amount: ${parsedAmount}`,
        debit: parsedAmount,
        credit: 0,
        balance: piggyBox.piggyBalance, // Updated balance after deduction
        UserId: user.id,
      },
      { transaction }
    );

    // Log Admin Activity
    await createAdminActivity(
      req,
      req.admin, // Assuming req.admin contains the admin's details
      "piggyBox",
      `Admin ${req.admin.userName} deducted ${parsedAmount} from user ${user.candidateId}'s wallet. Admin remark: ${remark}`,
      user.candidateId,
      transaction
    );

    // Log User Activity
    await createUserActivity(
      null, // Assuming this action is initiated by the admin
      user,
      "adminUpdate",
      `Funds of amount ${parsedAmount} were deducted from your wallet by admin. Admin remark: ${remark}`,
      transaction
    );

    // Commit the transaction
    await transaction.commit();

    // Send a confirmation message to the user
    sendDebitMessage(
      user.phone,
      parsedAmount.toFixed(2),
      user.candidateId,
      `ADM-35${thistory.id}`,
      piggyBox.piggyBalance.toFixed(2)
    );

    // Send a success response
    res.status(200).json({
      success: true,
      message: "Funds deducted successfully from the customer wallet.",
      data: {
        newBalance: piggyBox.piggyBalance, // Send the updated balance
      },
    });
  } catch (error) {
    // Rollback the transaction on error
    console.error("Error deducting funds from customer wallet:", error);
    if (transaction) {
      await transaction.rollback();
    }
    res.status(500).json({
      success: false,
      message: "Server error while deducting funds from the customer wallet.",
    });
  }
};
