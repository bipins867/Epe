const express = require("express");

const getRouter = require("./getRouter");
const postRouter = require("./postRouter");

const accountClouserRouter = require("./AccountClouser/accountClouser");
const customerRouter = require("./Customer/customer");
const referralRouter = require("./Referral/referral");
const requestWithdrawalRouter = require("./RequestWithdrawal/requestWithdrawal");
const transactionHistoryRouter = require("./TransactionHistory/transactionHistory");
const {
  adminAuthentication,
  roleAuthentication,
} = require("../../../Middleware/auth");
const { piggyBoxRole } = require("../../../Middleware/role");

const router = express.Router();

router.use("/transactionHistory", transactionHistoryRouter);
router.use("/requestWithdrawal", requestWithdrawalRouter);
router.use("/referral", referralRouter);
router.use("/customer", customerRouter);
router.use("/accountClouser", accountClouserRouter);
router.use(
  "/post",
  adminAuthentication,
  piggyBoxRole,
  roleAuthentication,
  postRouter
);
router.use("/", getRouter);

module.exports = router;
