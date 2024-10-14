const express = require("express");

const transactionHistoryPageController = require("../../../../Controller/Pages/Admin/PiggyBox/TransactionHistory/pages");

const router = express.Router();

router.get('/',transactionHistoryPageController.getDashboardPage)

module.exports = router;
