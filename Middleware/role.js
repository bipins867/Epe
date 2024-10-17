const Role = require("../Models/User/role");

async function applyRoleToRequest(req, identifier) {
  const roleInfo = await Role.findOne({ where: { identifier: identifier } });
  req.roleId = roleInfo.roleId;
  // console.log(identifier)
  // console.log(roleInfo)
}

exports.customerRole = async (req, res, next) => {
  const identifier = "customer";
  await applyRoleToRequest(req, identifier);
  next();
};

exports.piggyBoxRole = async (req, res, next) => {
  const identifier = "piggyBox";
  await applyRoleToRequest(req, identifier);
  next();
};

exports.accountClouserRole = async (req, res, next) => {
  const identifier = "accountClouser";
  await applyRoleToRequest(req, identifier);
  next();
};

exports.requestWithdrawalRole = async (req, res, next) => {
  const identifier = "requestWithdrawal";
  await applyRoleToRequest(req, identifier);
  next();
};

exports.transactionHistoryRole = async (req, res, next) => {
  const identifier = "transactionHistory";
  await applyRoleToRequest(req, identifier);
  next();
};

exports.referralRole = async (req, res, next) => {
  const identifier = "referral";
  await applyRoleToRequest(req, identifier);
  next();
};

exports.userActivityRole = async (req, res, next) => {
  const identifier = "userActivity";
  await applyRoleToRequest(req, identifier);
  next();
};

exports.kycRole = async (req, res, next) => {
  const identifier = "kycModule";
  await applyRoleToRequest(req, identifier);
  next();
};

exports.customerSupportRole = async (req, res, next) => {
  const identifier = "customerSupport";
  await applyRoleToRequest(req, identifier);
  next();
};

exports.contactUsRole = async (req, res, next) => {
  const identifier = "contactUs";
  await applyRoleToRequest(req, identifier);
  next();
};

exports.applyLoanRole = async (req, res, next) => {
  const identifier = "applyLoan";
  await applyRoleToRequest(req, identifier);
  next();
};
