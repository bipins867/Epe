const express = require("express");

const kycController = require("../../../Controller/Users/Kyc/kyc");
const { fileDataMiddleware } = require("../../../Utils/utils");

const router = express.Router();

router.post(
  "/kycSubmit", fileDataMiddleware([
    { name: "userImage", maxCount: 1 },
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panFile", maxCount: 1 }
  ],5 * 1024 * 1024),
  kycController.postFormSubmit
);

module.exports = router;
