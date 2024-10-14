const express = require("express");

const accountClouserController = require("../../../../Controller/Admin/PiggyBox/accountClouser");

const router = express.Router();

router.post(
  "/pendingList",
  accountClouserController.getPendingClosureRequestList
);
router.post(
  "/previousList",
  accountClouserController.getHistoryOfClosureRequestList
);
router.post("/customerInfo", accountClouserController.getCustomerInformation);
router.post(
  "/approveRequest",
  accountClouserController.approveCustomerClouserRequest
);
router.post(
  "/rejectRequest",
  accountClouserController.rejectCustomerClouserRequest
);

module.exports = router;
