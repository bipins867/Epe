const express = require("express");

const referralPageController = require("../../../../Controller/Pages/Admin/PiggyBox/Referral/pages");

const router = express.Router();

router.get('/customerPanel',referralPageController.getCustomerPanelPage)
router.get('/',referralPageController.getDashboardPage)

module.exports = router;
