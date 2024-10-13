const User = require("../../../Models/User/users");
const TransactionHistory = require("../../../Models/Transaction/TransactionHistory");
const Piggybox = require("../../../Models/PiggyBox/piggyBox");

const sequelize = require("../../../database");

exports.getCustomerTopRecentTransactionHistory = async (req, res, next) => {
  try {
    // Extract candidateId from the request body
    const { candidateId } = req.body;

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

    // Fetch the user's transaction history
    const transactionHistories = await TransactionHistory.findAll({
      where: { UserId: user.id }, // Assuming UserId is the foreign key in TransactionHistory
      order: [["createdAt", "DESC"]], // Order by creation date (most recent first)
      limit: 20, // Limit to the top 20 transactions
    });

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
    const { candidateId, amount } = req.body;

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount provided." });
    }

    // Start a Sequelize transaction

    // Fetch the user based on candidateId
    const user = await User.findOne({
      where: { candidateId },
      // transaction,
    });

    // Check if the user exists
    if (!user) {
      //await transaction.rollback();
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Fetch the user's PiggyBox
    const piggyBox = await Piggybox.findOne({
      where: { UserId: user.id },
      // transaction,
    });

    // Check if the PiggyBox exists
    if (!piggyBox) {
      // await transaction.rollback();
      return res
        .status(404)
        .json({ success: false, message: "PiggyBox not found for the user." });
    }

    // Add the amount to piggyBalance
    const parsedAmount = parseFloat(amount);
    piggyBox.piggyBalance += parsedAmount;

    //Initilizing the tranasction
    transaction = await sequelize.transaction();

    // Update the PiggyBox
    await piggyBox.save({ transaction });

    // Create a TransactionHistory entry
    await TransactionHistory.create(
      {
        transactionType: "adminUpdate",
        remark: `Admin is adding funds of amount: ${parsedAmount}`,
        debit: 0,
        credit: parsedAmount,
        balance: piggyBox.piggyBalance, // Updated balance after addition
        UserId: user.id,
      },
      { transaction }
    );

    // Commit the transaction
    await transaction.commit();

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

    if (transaction) {
      await transaction.rollback();
    }
    console.error("Error adding funds to customer wallet:", error);
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
    const { candidateId, amount } = req.body;

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount provided." });
    }

    // Fetch the user based on candidateId
    const user = await User.findOne({
      where: { candidateId },
      // transaction,
    });

    // Check if the user exists
    if (!user) {
      // await transaction.rollback();
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Fetch the user's PiggyBox
    const piggyBox = await Piggybox.findOne({
      where: { UserId: user.id },
      //  transaction,
    });

    // Check if the PiggyBox exists
    if (!piggyBox) {
      // await transaction.rollback();
      return res
        .status(404)
        .json({ success: false, message: "PiggyBox not found for the user." });
    }

    // Add the amount to piggyBalance
    const parsedAmount = parseFloat(amount);

    // Check if there are sufficient funds to deduct
    if (piggyBox.piggyBalance < parsedAmount) {
      //await transaction.rollback();
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
    await TransactionHistory.create(
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

    // Commit the transaction
    await transaction.commit();

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
    if (transaction) {
      await transaction.rollback();
    }
    console.error("Error deducting funds from customer wallet:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deducting funds from the customer wallet.",
    });
  }
};
