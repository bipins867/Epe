const path = require("path");


exports.getKycDashboardPage = async (req, res, next) => {
  res.sendFile(path.resolve("views", "Admin", "Kyc", "dashboard.html"));
};
exports.getUserDetailsPage = async (req, res, next) => {
  try {
    const emailId = req.params.emailId;
    
    

    res.sendFile(path.resolve("views", "Admin", "Kyc", "userDetails.html"));
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};
