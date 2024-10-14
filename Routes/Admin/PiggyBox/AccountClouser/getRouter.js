const express = require("express");

const accountClouserPageController = require("../../../../Controller/Pages/Admin/PiggyBox/AccountClouser/pages");

const router = express.Router();

router.get("/customerPanel/:customerId", accountClouserPageController.getCustomerPanelPage);
router.get(
  "/previousList",
  accountClouserPageController.getPreviosRequestListPage
);
router.get(
  "/pendingList",
  accountClouserPageController.getPendingRequestListPage
);
router.get("/", accountClouserPageController.getDashboardPage);

module.exports = router;
