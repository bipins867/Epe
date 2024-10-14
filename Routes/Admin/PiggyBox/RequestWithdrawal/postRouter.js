const express = require("express");

const requestWithdrawalController = require("../../../../Controller/Admin/PiggyBox/requestWithdrawal");

const router = express.Router();

router.post(
  "/withdrawalList",
  requestWithdrawalController.getWithdrawalRequestList
);
router.post(
  "/customerInfo",
  requestWithdrawalController.getCustomerInformation
);
router.post(
  "/updateStatus",
  requestWithdrawalController.updateCustomerWithdrawalStatus
);

module.exports = router;
