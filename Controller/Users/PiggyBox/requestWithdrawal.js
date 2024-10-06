const UserKyc = require("../../../Models/Kyc/userKyc");
const BankDetails = require("../../../Models/PiggyBox/bankDetails");
const Piggybox = require("../../../Models/PiggyBox/piggyBox");
const RequestWithdrawal = require("../../../Models/PiggyBox/requestWithdrawal");

exports.requestWithdrawalInfo = async (req, res, next) => {
  try {
    const userId = req.user.id; // Get the user ID from the request

    // Fetch piggyBox balance
    const piggyBox = await Piggybox.findOne({
      where: { UserId: userId },
    });

    // Fetch bank details
    const bankDetails = await BankDetails.findOne({
      where: { UserId: userId },
    });

    // Fetch KYC status
    const userKyc = await UserKyc.findOne({
      where: { customerId: req.user.candidateId }, // Using candidateId for the KYC lookup
    });

    // Fetch withdrawal history (top 10)
    const withdrawalHistory = await RequestWithdrawal.findAll({
      where: { UserId: userId },
      order: [["requestDate", "DESC"]], // Order by requestDate descending
      limit: 10, // Limit to top 10 requests
    });

    // Prepare the response data
    const response = {
      piggyBoxBalance: piggyBox ? piggyBox.piggyBalance : 0, // Fallback to 0 if no piggybox found
      bankDetails: bankDetails || {}, // Return bank details or empty object if not found
      kycStatus: userKyc ? userKyc.status : "Not Found", // Fallback if no KYC found
      withdrawalHistory,
    };

    // Return the response
    return res.status(200).json(response);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

exports.requestForWithdrawal = async (req, res, next) => {
  const { amount, userRemark } = req.body; // Extract amount and user remark from the request body
  const userId = req.user.id; // Get the user ID from the request

  try {
    // Step 1: Check if KYC agreement is accepted
    const userKyc = await UserKyc.findOne({
      where: { customerId: req.user.candidateId }, // Use candidateId to find user KYC
    });

    if (!userKyc || !userKyc.userAggreementAccepted) {
      return res.status(403).json({ message: "KYC agreement not accepted or KYC not Completed!." });
    }

    // Step 2: Check if bank details exist
    const bankDetails = await BankDetails.findOne({
      where: { UserId: userId }, // Check for bank details associated with the user
    });

    if (!bankDetails) {
      return res
        .status(400)
        .json({
          message: "Bank details not found. Please provide bank information.",
        });
    }

    // Step 3: Check the user's piggybox balance
    const piggyBox = await Piggybox.findOne({
      where: { UserId: userId }, // Fetch the user's piggybox
    });

    if (!piggyBox) {
      return res.status(400).json({ message: "PiggyBox not found." });
    }

    // Check if the withdrawal would violate the minimum balance requirement
    const remainingBalance = piggyBox.piggyBalance - amount; // Calculate remaining balance after withdrawal

    if (remainingBalance < 2000) {
      return res
        .status(400)
        .json({
          message:
            "Insufficient funds. Minimum balance of 2000 must be maintained after withdrawal.",
        });
    }

    // Step 4: Validate withdrawal amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid withdrawal amount." });
    }

    // Step 5: Create the withdrawal request
    const withdrawalRequest = await RequestWithdrawal.create({
      requestDate: new Date(), // Current date and time for the request
      amount,
      userRemark: userRemark || null, // User remark can be optional
      status: "Pending", // Initial status for the withdrawal request
      UserId: userId, // Associate with the user
    });

    // Return success response
    return res
      .status(201)
      .json({
        message: "Withdrawal request submitted successfully.",
        requestId: withdrawalRequest.requestId,
      });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

