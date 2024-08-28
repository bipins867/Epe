const express = require("express");

const postRouter = require("./postRoter");

const router = express.Router();

router.use("/post", postRouter);

module.exports = router;
