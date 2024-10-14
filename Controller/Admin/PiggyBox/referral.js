const Referrals = require("../../../Models/PiggyBox/referrals");
const ReferredUser = require("../../../Models/PiggyBox/referredUsers");
const User = require("../../../Models/User/users");

exports.getCustomerReferralList = async (req, res, next) => {
  try {
    // Fetch the recent 20 users, excluding the password field
    const users = await User.findAll({
      limit: 20,
      attributes: { exclude: ["password"] }, // Exclude password from the results
      order: [["createdAt", "DESC"]], // Order by the most recent
    });

    //   // If no users found, send a 404 response
    //   if (!users || users.length === 0) {
    //     return res.status(404).json({
    //       success: false,
    //       message: "No users found.",
    //     });
    //   }

    // Send the list of users
    return res.status(200).json({
      success: true,
      message: "List of users retrieved successfully.",
      data: users,
    });
  } catch (error) {
    // Log the error and send a 500 response
    console.error("Error retrieving customer referral list:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving the customer referral list.",
    });
  }
};

exports.getSearchedCustomerInformation = async (req, res, next) => {
  try {
    // Extract the candidateId from the request body
    const { candidateId } = req.body;

    // Validate if candidateId is provided
    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: "candidateId is required.",
      });
    }

    // Fetch the user based on candidateId
    const user = await User.findAll({
      where: { candidateId },
      attributes: { exclude: ["password"] }, // Exclude password from the result
    });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Send the user information
    return res.status(200).json({
      success: true,
      message: "User information retrieved successfully.",
      data: user,
    });
  } catch (error) {
    // Log the error and send a 500 response
    console.error("Error retrieving customer information:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving the customer information.",
    });
  }
};

exports.getCustomerReferralInfo = async (req, res, next) => {
  try {
    // Extract the candidateId from the request body
    const { candidateId } = req.body;

    // Validate if candidateId is provided
    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: "candidateId is required.",
      });
    }

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

    // Fetch referral information associated with the user
    const referral = await Referrals.findOne({
      where: { UserId: user.id }, // Assuming the Referrals table has UserId to associate with the user
    });

    // Check if the referral info exists for the user
    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Referral information not found for this user.",
      });
    }

    // Fetch referred users associated with the referral
    const referredUsers = await ReferredUser.findAll({
      where: { ReferralId: referral.id }, // Assuming ReferralId in ReferredUser links to Referrals
    });

    // Send referral and referred users information
    return res.status(200).json({
      success: true,
      message: "Referral information retrieved successfully.",
      data: {
        referral,
        referredUsers,
      },
    });
  } catch (error) {
    // Log the error and send a 500 response
    console.error("Error retrieving customer referral information:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving customer referral information.",
    });
  }
};
