const express = require("express");

const requestWithdrawalPageController = require("../../../../Controller/Pages/Admin/PiggyBox/RequestWithdrawal/pages");

const router = express.Router();

router.get('/customerPanel',requestWithdrawalPageController.getCustomerPanelPage)
router.get('/previousList',requestWithdrawalPageController.getPreviousRequestListPage)
router.get('/pendingList',requestWithdrawalPageController.getPendingRequestListPage)
router.get('/',requestWithdrawalPageController.getDashboardPage)

module.exports = router;
