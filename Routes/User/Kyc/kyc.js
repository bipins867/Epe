const express = require("express");

const kycController = require("../../../Controller/Users/Kyc/kyc");
const { fileDataMiddleware } = require("../../../Utils/utils");
const {
  kycValidator,
  validateKyc,
  checkFileSize,
  panValidator,
} = require("../../../Middleware/kyc");

const { userInfoVerification } = require("../../../Middleware/auth");

const router = express.Router();

router.post(
  "/kycSubmit",
  userInfoVerification,
  checkFileSize,
  fileDataMiddleware([
    { name: "userImage", maxCount: 1 },
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    //{ name: "panFile", maxCount: 1 },
  ]),
  kycValidator,
  validateKyc,
  kycController.postFormSubmit
);

router.post(
  "/panSubmit",
  userInfoVerification,
  checkFileSize,
  fileDataMiddleware([{ name: "panFile", maxCount: 1 }]),

  panValidator,
  validateKyc,
  kycController.updatePanDetails
);

router.get("/userKycAgreementInfo", kycController.getUserAgreementInfo);
router.get("/acceptUserAgreement", kycController.acceptUserAgreement);
router.get('/kycAndPanInfo',kycController.getUserKycAndPanInfo)

module.exports = router;
