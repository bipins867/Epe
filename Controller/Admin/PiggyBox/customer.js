const { Op } = require("sequelize"); // Sequelize operator for date filtering
const User = require("../../../Models/User/users");
const PiggyBox = require("../../../Models/PiggyBox/piggyBox");
const BankDetails = require("../../../Models/PiggyBox/bankDetails");
const SavedAddress = require("../../../Models/PiggyBox/savedAddress");

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
    const piggyBox = await PiggyBox.findOne({ where: { UserId: user.id } });

    // Fetch the BankDetails associated with the user
    const bankDetails = await BankDetails.findOne({
      where: { UserId: user.id },
    });

    // Fetch the SavedAddress associated with the user
    const savedAddress = await SavedAddress.findOne({
      where: { UserId: user.id },
    });

    // Prepare the response data
    const responseData = {
      user,
      piggyBox,
      bankDetails,
      savedAddress,
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

exports.updateCustomerInformation = async (req, res, next) => {
  try {
    // Extract candidateId and updated fields from the request body
    const { candidateId, name, email, phone, employeeId } = req.body;
    
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

    // Update user information
    user.name = name || user.name; // Only update if a new value is provided
    user.email = email || user.email; // Only update if a new value is provided
    user.phone = phone || user.phone; // Only update if a new value is provided
    user.employeeId = employeeId || user.employeeId; // Only update if a new value is provided
    //user.adminId=req.admin.userName;
    user.adminRemark='Admin updated the user information.'
    // Save the updated user to the database
    await user.save();

    // Send a success response
    res.status(200).json({
      success: true,
      message: "User information updated successfully.",
      data: user, // Return the updated user data
    });
  } catch (error) {
    console.error("Error updating customer information:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating customer information.",
    });
  }
};

exports.updateBlockedStatus = async (req, res) => {
  const { candidateId, isBlocked,adminRemark } = req.body;

  // Validate request input
  if (!candidateId || typeof isBlocked !== "boolean") {
    return res.status(400).json({
      success: false,
      message:
        "Invalid input: candidateId and isBlocked are required and must be valid.",
    });
  }

  try {
    // Find the user by candidateId
    const user = await User.findOne({ where: { candidateId } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update the isBlocked status
    user.isBlocked = isBlocked;
   // user.adminId=req.admin.userName;
    user.adminRemark=adminRemark;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
      user: {
        candidateId: user.candidateId,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    console.error("Error updating user blocked status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};
