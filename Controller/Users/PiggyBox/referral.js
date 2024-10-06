const Referrals = require("../../../Models/PiggyBox/referrals");
const ReferredUser = require("../../../Models/PiggyBox/referredUsers");



exports.getReferalInfo = async (req, res, next) => {
    try {
      const userId = req.user.id; // Get the user ID from the request
  
      // Fetch the referral information associated with the user
      const referralInfo = await Referrals.findOne({
        where: { UserId: userId }, // Assuming there's a UserId in the Referrals table
        include: [{ model: ReferredUser }], // Include the referred users
      });
  
      // Check if referral information exists
      if (!referralInfo) {
        return res.status(404).json({ message: "No referral information found." });
      }
  
      // Return the referral information along with the referred users
      return res.status(200).json({
        referralId: referralInfo.referalId,
        numberOfReferrals: referralInfo.noOfReferals,
        pendingReferrals: referralInfo.pendingReferals,
        referredUsers: referralInfo.ReferredUsers, // List of referred users
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error. Please try again later." });
    }
  };