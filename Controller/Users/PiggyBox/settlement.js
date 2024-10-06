const BankDetails = require("../../Models/PiggyBox/bankDetails");


exports.getBankDetails = async (req, res, next) => {
  try {
    // Fetch the bank details using the user ID
    const bankDetails = await BankDetails.findOne({ where: { UserId: req.user.id } });

    if (!bankDetails) {
      return res.status(404).json({ message: "No bank details found." });
    }

    // Return the bank details
    return res.status(200).json({ bankDetails });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error. Please try again later." });
  }
};


exports.updateBankDetails = async (req, res, next) => {
    const { bankName, accountHolderName, accountNumber, ifscCode } = req.body; // Extract bank details from request body
  
    try {
      // Fetch existing bank details
      const existingBankDetails = await BankDetails.findOne({ where: { UserId: req.user.id } });
  
      if (existingBankDetails) {
        // Update the existing bank details
        await existingBankDetails.update({
          bankName,
          accountHolderName,
          accountNumber,
          ifscCode,
        });
  
        return res.status(200).json({ message: "Bank details updated successfully.", bankDetails: existingBankDetails });
      } else {
        // Create new bank details if they do not exist
        const newBankDetails = await BankDetails.create({
          UserId: req.user.id, // Associate with the user
          bankName,
          accountHolderName,
          accountNumber,
          ifscCode,
        });
  
        return res.status(201).json({ message: "Bank details created successfully.", bankDetails: newBankDetails });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error. Please try again later." });
    }
  };
  