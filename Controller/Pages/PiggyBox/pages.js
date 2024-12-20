const path = require("path");

exports.getCloseAccountPage=async (req, res, next) => {
  res.sendFile(
    path.resolve("views", "PiggyBox", "Dashboard", "closeAccount.html")
  );
};
exports.getCloseAccountTermsAndConditionsPage=async (req, res, next) => {
  res.sendFile(
    path.resolve("views", "PiggyBox", "Dashboard", "closeAccountTermsAndConditions.html")
  );
};

exports.getDashboardPage = async (req, res, next) => {
  res.sendFile(
    path.resolve("views", "PiggyBox", "Dashboard", "dashboard.html")
  );
};
exports.getAddFundsPage = async (req, res, next) => {
  res.sendFile(
    path.resolve("views", "PiggyBox", "Dashboard", "addFunds.html")
  );
};
exports.getPaymentStatusPage = async (req, res, next) => {
  res.sendFile(
    path.resolve("views", "PiggyBox", "Dashboard", "paymentStatus.html")
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


exports.getReferralPage = async (req, res, next) => {
  res.sendFile(
    path.resolve(
      "views",
      "PiggyBox",
      "Referral",
      "referral.html"
    )
  );
};

exports.getLoansPage = async (req, res, next) => {
  res.sendFile(
    path.resolve(
      "views",
      "PiggyBox",
      "Loans",
      "loans.html"
    )
  );
};


exports.getTransferMoneyPage = async (req, res, next) => {
  res.sendFile(
    path.resolve(
      "views",
      "PiggyBox",
      "TransferMoney",
      "transferMoney.html"
    )
  );
};

exports.getSavedAddressPage = async (req, res, next) => {
  res.sendFile(
    path.resolve(
      "views",
      "PiggyBox",
      "SavedAddress",
      "savedAddress.html"
    )
  );
};

exports.getSettlementPage = async (req, res, next) => {
  res.sendFile(
    path.resolve(
      "views",
      "PiggyBox",
      "Settlement",
      "settlement.html"
    )
  );
};

exports.getUserActivityPage = async (req, res, next) => {
  res.sendFile(
    path.resolve(
      "views",
      "PiggyBox",
      "UserActivity",
      "userActivity.html"
    )
  );
};


exports.getSubhDhanLabhPage=async(req,res,next)=>{
  res.sendFile(
    path.resolve(
      "views",
      "PiggyBox",
      "SubhDhanLabh",
      "subhDhanLabh.html"
    )
  );
}

exports.getTicketCardInfoPage=async(req,res,next)=>{
  res.sendFile(
    path.resolve(
      "views",
      "PiggyBox",
      "SubhDhanLabh",
      "ticketCardInfo.html"
    )
  );
}