const TransactionHistory = require("../../../Models/PiggyBox/transactionHistory");
const User = require("../../../Models/User/users");
const sequelize = require("../../../database");
const Sequelize = require("sequelize");

exports.getTopTransactionHistories = async (req, res, next) => {
  try {
    // Fetch the top 20 recent transaction histories along with associated User's candidateId
    const transactionHistories = await TransactionHistory.findAll({
      limit: 20,
      order: [["createdAt", "DESC"]], // Fetch most recent transactions first
      include: [
        {
          model: User, // Including User information with the transaction history
          attributes: ["candidateId", "name", "email", "phone"], // Fetch only the candidateId from the User
        },
      ],
    });

    // If no transaction histories found
    if (!transactionHistories || transactionHistories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No transaction histories found.",
      });
    }

    // Send the transaction histories as a response
    return res.status(200).json({
      success: true,
      message: "Top 20 recent transaction histories retrieved successfully.",
      data: transactionHistories,
    });
  } catch (error) {
    // Log the error and send a 500 response
    console.error("Error fetching top transaction histories:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching top transaction histories.",
    });
  }
};

exports.getCustomDateTransactionHistories = async (req, res, next) => {
  try {
    // Extract fromDate and toDate from the request body
    const { fromDate, toDate } = req.body;

    // Validate if both fromDate and toDate are provided
    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide both fromDate and toDate.",
      });
    }

    // Convert fromDate and toDate to Date objects for filtering
    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);

    // Validate date objects
    if (isNaN(fromDateObj.getTime()) || isNaN(toDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Please provide valid dates.",
      });
    }

    // Fetch transaction histories within the date range
    const transactionHistories = await TransactionHistory.findAll({
      where: {
        createdAt: {
          [Op.between]: [fromDateObj, toDateObj], // Sequelize 'between' operator for date range
        },
      },
      order: [["createdAt", "DESC"]], // Sort by most recent transactions
      include: [
        {
          model: User, // Include associated User
          attributes: ["candidateId", "email", "phone", "name"], // Include only the candidateId
        },
      ],
    });

    // If no transaction histories found
    if (!transactionHistories || transactionHistories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No transaction histories found for the given date range.",
      });
    }

    // Send the transaction histories as a response
    return res.status(200).json({
      success: true,
      message: "Transaction histories retrieved successfully.",
      data: transactionHistories,
    });
  } catch (error) {
    // Log the error and send a 500 response
    console.error("Error fetching transaction histories:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching transaction histories.",
    });
  }
};

exports.getCustomerInformation = async (req, res, next) => {
  try {
    // Extract candidateId from the request body
    const { candidateId } = req.body;

    // Fetch the user based on candidateId, excluding the password field
    const user = await User.findOne({
      where: { candidateId },
      attributes: { exclude: ["password"] }, // Exclude password from the results
    });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Return the user information
    return res.status(200).json({
      success: true,
      message: "User information retrieved successfully.",
      data: user,
    });
  } catch (error) {
    // Log the error and return a 500 response
    console.error("Error retrieving user information:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving user information.",
    });
  }
};

exports.getCustomerTransactionHistories = async (req, res, next) => {
  try {
    // Extract candidateId from the request body
    const { candidateId } = req.body;

    // Fetch the user based on candidateId
    const user = await User.findOne({
      where: { candidateId },
    });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Fetch the top 20 recent transactions associated with the user
    const transactionHistories = await TransactionHistory.findAll({
      where: { UserId: user.id },
      limit: 20,
      order: [["createdAt", "DESC"]], // Order by most recent transactions
    });

    // Return the transaction history
    return res.status(200).json({
      success: true,
      message: "Transaction histories retrieved successfully.",
      data: transactionHistories,
    });
  } catch (error) {
    // Log the error and return a 500 response
    console.error("Error retrieving transaction histories:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving transaction histories.",
    });
  }
};
