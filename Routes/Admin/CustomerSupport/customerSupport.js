const express = require("express");
const getRouter = require("./getRouter");
const postRouter = require("./postRouter");
const { customerSupportRole } = require("../../../Middleware/role");
const { roleAuthentication, adminAuthentication } = require("../../../Middleware/auth");

const router = express.Router();

router.use("/post",adminAuthentication, customerSupportRole, roleAuthentication, postRouter);
router.use("/", getRouter);

module.exports = router;
