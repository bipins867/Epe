const { Op } = require("sequelize"); // Sequelize operator for date filtering
const User = require("../../../Models/User/users");
const PiggyBox = require("../../../Models/PiggyBox/piggyBox");
const BankDetails = require("../../../Models/PiggyBox/bankDetails");
const SavedAddress = require("../../../Models/PiggyBox/savedAddress");
const sequelize = require("../../../database");
const { sendUserUnblockMessage } = require("../../../Utils/MailService");
const {
  createUserActivity,
  createAdminActivity,
} = require("../../../Utils/activityUtils");

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
  let transaction;
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

    transaction = await sequelize.transaction();

    // Store the changes that will be logged
    let changes = [];

    // Check and log changes
    if (name && name !== user.name) {
      changes.push(`Name: '${user.name}' -> '${name}'`);
      user.name = name; // Update if changed
    }
    if (email && email !== user.email) {
      changes.push(`Email: '${user.email}' -> '${email}'`);
      user.email = email; // Update if changed
    }
    if (phone && phone !== user.phone) {
      changes.push(`Phone: '${user.phone}' -> '${phone}'`);
      
      const newUserPhone=await User.findOne({where:{phone}})
      if(newUserPhone){
        return res.status(403).json({error:"Mobile number already exists!"})
      }

      user.phone = phone; // Update if changed
    }
    if (employeeId && employeeId !== user.employeeId) {
      changes.push(`Employee ID: '${user.employeeId}' -> '${employeeId}'`);
      user.employeeId = employeeId; // Update if changed
    }
    if(changes.length==0){
      return res.status(402).json({error:"Nothing to update!"})
    }

    // If there are changes, construct the activity description
    const activityDescription = changes.length > 0
      ? `Updated fields: ${changes.join(", ")}`
      : "No changes in user information.";

    // Update adminRemark if applicable
    user.adminRemark = "Admin updated the user information.";

    // Save the updated user to the database
    await user.save({ transaction });

    // Create AdminActivity for logging
    await createAdminActivity(
      req,
      req.admin,
      "customer",
      `Admin updated customer (ID: ${user.candidateId}). ${activityDescription}`,
      user.candidateId,
      transaction
    );

    // Create UserActivity for logging
    await createUserActivity(
      null, // Since this is an admin action, req is null
      user,
      "adminUpdate",
      `Admin ${req.admin.userName} updated your account. ${activityDescription}`,
      transaction
    );

    // Commit the transaction
    await transaction.commit();

    // Send a success response
    res.status(200).json({
      success: true,
      message: "User information updated successfully.",
      data: user, // Return the updated user data
    });
  } catch (error) {
    console.error("Error updating customer information:", error);
    if (transaction) {
      await transaction.rollback();
    }
    res.status(500).json({
      success: false,
      message: "Server error while updating customer information.",
    });
  }
};


exports.updateBlockedStatus = async (req, res) => {
  const { candidateId, isBlocked, adminRemark } = req.body;

  // Validate request input
  if (!candidateId || typeof isBlocked !== "boolean") {
    return res.status(400).json({
      success: false,
      message:
        "Invalid input: candidateId and isBlocked are required and must be valid.",
    });
  }

  let transaction;
  try {
    // Find the user by candidateId
    const user = await User.findOne({ where: { candidateId } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if(user.isBlocked===isBlocked){
      return res.status(403).json({error:"Status is already as it's!"})
    }

    transaction = await sequelize.transaction();

    // Check if there is any change in the blocked status
    const previousStatus = user.isBlocked;
    user.isBlocked = isBlocked;
    user.adminRemark = adminRemark;
    
    // Save the updated status in the database
    await user.save({ transaction });

    // Log the activity in AdminActivity
    await createAdminActivity(
      req,
      req.admin, // Assuming `req.admin` contains the admin performing the action
      "customer",
      `Admin ${req.admin.userName} ${isBlocked ? "blocked" : "unblocked"} user (ID: ${user.candidateId}). Previous status: ${previousStatus ? "blocked" : "unblocked"}. Admin remark: ${adminRemark}`,
      user.candidateId,
      transaction
    );

    // Log the activity in UserActivity
    await createUserActivity(
      null, // Since it's an admin action, req is null
      user,
      "adminUpdate",
      `Your account has been ${isBlocked ? "blocked" : "unblocked"} by admin ${req.admin.userName}. Admin remark: ${adminRemark}`,
      transaction
    );

    // Commit the transaction
    await transaction.commit();

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

    if (transaction) {
      await transaction.rollback();
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

exports.updateActiveStatus = async (req, res) => {
  const { candidateId, isActive, adminRemark } = req.body;

  // Validate request input
  if (!candidateId || typeof isActive !== "boolean") {
    return res.status(400).json({
      success: false,
      message:
        "Invalid input: candidateId and isActive are required and must be valid.",
    });
  }

  let transaction; // Start a transaction

  try {
    // Find the user by candidateId
    const user = await User.findOne({ where: { candidateId } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deactivating the user
    if (!isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin can't deactivate user account!",
      });
    }

    // Fetch user's Piggybox
    const piggybox = await PiggyBox.findOne({ where: { UserId: user.id } });

    if (!piggybox) {
      return res.status(404).json({ success: false, message: "PiggyBox not found!" });
    }

    transaction = await sequelize.transaction();

    // Update the isActive status and other user details
    const previousStatus = user.isActive;
    user.isActive = isActive;
    user.adminRemark = adminRemark;

    // Update Piggybox if needed
    piggybox.isFundedFirst = false;
    await piggybox.save({ transaction });

    await user.save({ transaction });

    // Log Admin Activity
    await createAdminActivity(
      req,
      req.admin, // Assuming req.admin contains the admin's details
      "customer",
      `Admin ${req.admin.userName} activated user (ID: ${user.candidateId}). Previous status: ${previousStatus ? "active" : "inactive"}. Admin remark: ${adminRemark}`,
      user.candidateId,
      transaction
    );

    // Log User Activity
    await createUserActivity(
      null, // Since this is an admin action, req is null
      user,
      "adminUpdate",
      `Your account has been activated by admin ${req.admin.userName}. Admin remark: ${adminRemark}`,
      transaction
    );

    // Commit the transaction after successful updates
    await transaction.commit();

    // If user is active, send an unblock message
    if (isActive) {
      sendUserUnblockMessage(user.phone);
    }

    return res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user: {
        candidateId: user.candidateId,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    if (transaction) {
      await transaction.rollback(); // Rollback transaction in case of error
    }
    console.error("Error updating user Active status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};
