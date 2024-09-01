const express = require("express");

const kycController = require("../../../Controller/Users/Kyc/kyc");
const { fileDataMiddleware } = require("../../../Utils/utils");
const {
  kycValidator,
  validateKyc,
  checkFileSize,
} = require("../../../Middleware/kyc");

const router = express.Router();

router.post(
  "/kycSubmit",
  checkFileSize,
  fileDataMiddleware([
    { name: "userImage", maxCount: 1 },
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panFile", maxCount: 1 },
  ]),
  kycValidator,
  validateKyc,
  kycController.postFormSubmit
);

module.exports = router;
