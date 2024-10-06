const UserKyc = require("../../../Models/Kyc/userKyc");
const Piggybox = require("../../../Models/PiggyBox/piggyBox");
const TransactionHistory = require("../../../Models/PiggyBox/transactionHistory");



exports.getPiggyBoxInfo = async (req, res, next) => {
    try {
      // Get the user information from the request
      const userId = req.user.id; // Assuming req.user contains the authenticated user's info
      const candidateId = req.user.candidateId;
  
      // Fetch user KYC information
      const userKyc = await UserKyc.findOne({
        where: { customerId: candidateId }, // Using candidateId to find associated KYC
      });
  
      // Fetch user's piggybox information
      const piggyBox = await Piggybox.findOne({
        where: { UserId: userId },
      });
  
      // Fetch transaction history for the user
      const transactionHistory = await TransactionHistory.findAll({
        where: { UserId: userId }, // Assuming merchantUserId corresponds to the user's ID
      });
  
      // Prepare the response data
      const response = {
        name: req.user.name,
        customerId: candidateId,
        kycStatus: userKyc ? userKyc.status : "Pending.",
        piggyboxBalance: piggyBox ? piggyBox.piggyBalance : 0,
        transactionHistory,
      };
  
      // Return the response
      return res.status(200).json(response);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error. Please try again later." });
    }
  };


exports.getTransactionHistory = async (req, res, next) => {
    const { fromDate, toDate } = req.body; // Extract dates from the request body
    const userId = req.user.id; // Get the user ID from the request
  
    try {
      // Validate date inputs
      if (!fromDate || !toDate) {
        return res.status(400).json({ message: "Both 'fromDate' and 'toDate' are required." });
      }
  
      // Fetch transaction history for the user within the specified date range
      const transactions = await TransactionHistory.findAll({
        where: {
          UserId: userId,
          createdAt: {
            [Sequelize.Op.between]: [new Date(fromDate), new Date(toDate)], // Use Sequelize's Op.between to filter by date
          },
        },
        order: [['createdAt', 'DESC'],], // Optional: Order transactions by creation date
      });
  
      // Return the transaction history
      return res.status(200).json(transactions);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error. Please try again later." });
    }
  };