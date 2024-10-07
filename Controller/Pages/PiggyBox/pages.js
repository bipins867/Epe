const path = require("path");

exports.getDashboardPage = async (req, res, next) => {
  res.sendFile(
    path.resolve("views", "PiggyBox", "Dashboard", "dashboard.html")
  );
};
exports.getKitPage = async (req, res, next) => {
  res.sendFile(path.resolve("views", "PiggyBox", "Kit", "kit.html"));
};

exports.getRequestWithdrawalPage = async (req, res, next) => {
  res.sendFile(
    path.resolve(
      "views",
      "PiggyBox",
      "RequestWithdrawal",
      "requestWithdrawal.html"
    )
  );
};
