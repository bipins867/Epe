//User-Models
const User = require("./User/users");
const UserKyc = require("./Kyc/userKyc");
const ResetPassword = require("./User/resetPassword");

const Admin = require("./User/admins");
const Role = require("./User/role");
const AdminAndRole = require("./User/adminAndRole");

const CaseUser = require("./CustomerSupport/caseUser");
const CaseMessage = require("./CustomerSupport/caseMessage");
const CustomerCase = require("./CustomerSupport/customerCase");
const CaseAndAdmin = require("./CustomerSupport/caseAndAdmin");

const ContactUs = require("./Basic/contactUs");
const ApplyLoan = require("./Basic/applyLoan");
const Newsletter = require("./Basic/newsLetter");

//PiggyBox related Models
const Piggybox = require("./PiggyBox/piggyBox");
const BankDetails = require("./PiggyBox/bankDetails");
const RequestWithdrawal = require("./PiggyBox/requestWithdrawal");
const SavedAddress = require("./PiggyBox/savedAddress");
const TransactionHistory = require("./PiggyBox/transactionHistory");
const Referrals = require("./PiggyBox/referrals");
const ReferredUser = require("./PiggyBox/referredUsers");
const Transaction = require("./PiggyBox/transaction");

User.hasOne(UserKyc);
UserKyc.belongsTo(User);

Admin.belongsToMany(Role, { through: AdminAndRole, foreignKey: "AdminId" });
Role.belongsToMany(Admin, { through: AdminAndRole, foreignKey: "RoleId" });

CaseUser.hasOne(CustomerCase);
CustomerCase.belongsTo(CaseUser);

CustomerCase.hasMany(CaseMessage);
CaseMessage.belongsTo(CustomerCase);

// Admin.belongsToMany(CustomerCase,{ through: CaseAndAdmin, foreignKey: 'AdminId' })
// CustomerCase.belongsToMany(Admin,{ through: CaseAndAdmin, foreignKey: 'CustomerCaseId' })

User.hasMany(ResetPassword);
ResetPassword.belongsTo(User);

/*This is the model section for the PiggyBox------------------------------------*/

User.hasOne(Piggybox);
Piggybox.belongsTo(User);

User.hasOne(BankDetails);
BankDetails.belongsTo(User);

User.hasOne(SavedAddress);
SavedAddress.belongsTo(User);

User.hasMany(RequestWithdrawal);
RequestWithdrawal.belongsTo(User);

User.hasMany(TransactionHistory);
TransactionHistory.belongsTo(User);

User.hasMany(Transaction);
Transaction.belongsTo(User);

User.hasOne(Referrals);
Referrals.belongsTo(User);

Referrals.hasMany(ReferredUser);
ReferredUser.belongsTo(Referrals);
