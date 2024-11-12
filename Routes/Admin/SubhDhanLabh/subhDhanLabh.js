const express = require("express");

const getRouter = require("./getRouter");
const postRouter = require("./postRouter");
const { adminAuthentication } = require("../../../Middleware/auth");

const router = express.Router();

router.use("/post", adminAuthentication, postRouter);
router.use("/", getRouter);

module.exports = router;
