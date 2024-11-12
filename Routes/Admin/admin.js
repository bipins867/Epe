const express = require("express");
const getRouter = require("./getRouter");
const kycRouter = require("./Kyc/kyc");
const userAndRoleRouter = require("./UserAndRole/userAndRole");
const postRouter = require("./postRouter");
const customerSupportRouter = require("./CustomerSupport/customerSupport");
const basicRouter = require("./Basic/basic");
const piggyBoxRouter = require("./PiggyBox/piggyBox");
const subDhanLabhRouter = require("./SubhDhanLabh/subhDhanLabh");

const router = express.Router();

router.use("/subhDhanLabh", subDhanLabhRouter);
router.use("/piggyBox", piggyBoxRouter);
router.use("/basic", basicRouter);
router.use("/customerSupport", customerSupportRouter);
router.use("/userAndRole", userAndRoleRouter);
router.use("/kyc", kycRouter);
router.use("/post", postRouter);
router.use("/", getRouter);

module.exports = router;
