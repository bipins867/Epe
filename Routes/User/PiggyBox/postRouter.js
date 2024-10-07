const express = require("express");

const piggyBoxController = require("../../../Controller/Users/PiggyBox/piggyBox");
const { userAuthentication } = require("../../../Middleware/auth");

const router = express.Router();

router.post(
  "/redirectedPaymentInfo/:merchantTransactionId",
  piggyBoxController.redirectedPaymentInfo
);
router.post(
  "/callbackPaymentInfo/:merchantTransactionId",
  piggyBoxController.callbackPaymentInfo
);
router.post("/checkPaymentStatus",userAuthentication, piggyBoxController.checkPaymentStatus);
router.post("/addFunds", userAuthentication, piggyBoxController.addFunds);
router.post(
  "/getPiggyBoxInfo",
  userAuthentication,
  piggyBoxController.getPiggyBoxInfo
);
router.post(
  "/getTransactionHistory",
  userAuthentication,
  piggyBoxController.getTransactionHistory
);

module.exports = router;
