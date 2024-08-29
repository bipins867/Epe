const express = require("express");
const adminKycController = require("../../../Controller/Admin/Kyc/kyc");
const { adminAuthentication } = require("../../../Middleware/auth");

const router = express.Router();

router.post("/updateStatus",adminAuthentication, adminKycController.updateKycStatus);
router.get("/pendingKycs",adminAuthentication, adminKycController.getPendingKycs);

module.exports = router;
