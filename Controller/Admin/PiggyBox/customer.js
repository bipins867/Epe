
const User = require("../../../Models/User/users");
const PiggyBox = require("../../../Models/PiggyBox/piggyBox");
const BankDetails = require("../../../Models/User/bankDetails");
const SavedAddress = require("../../../Models/User/savedAddress");

exports.getCustomerInformation = async (req, res, next) => {
  try {
    // Extract candidateId from the request body
    const { candidateId } = req.body;

    // Fetch the user based on candidateId
    const user = await User.findOne({
      where: { candidateId },
      attributes: { exclude: ['password'] }, // Exclude password from the response
    });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Fetch the PiggyBox associated with the user
    const piggyBox = await PiggyBox.findOne({ where: { UserId: user.id } });

    // Fetch the BankDetails associated with the user
    const bankDetails = await BankDetails.findOne({ where: { UserId: user.id } });

    // Fetch the SavedAddress associated with the user
    const savedAddress = await SavedAddress.findOne({ where: { UserId: user.id } });

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
      message: 'Server error while fetching customer information.',
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
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Update user information
    user.name = name || user.name; // Only update if a new value is provided
    user.email = email || user.email; // Only update if a new value is provided
    user.phone = phone || user.phone; // Only update if a new value is provided
    user.employeeId = employeeId || user.employeeId; // Only update if a new value is provided

    // Save the updated user to the database
    await user.save();

    // Send a success response
    res.status(200).json({
      success: true,
      message: 'User information updated successfully.',
      data: user, // Return the updated user data
    });

  } catch (error) {
    console.error("Error updating customer information:", error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating customer information.',
    });
  }
};
