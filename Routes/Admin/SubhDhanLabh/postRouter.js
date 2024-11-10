const express = require("express");

const subhDhanLabhController = require("../../../Controller/Admin/SubhDhanLabh/subhDhanLabh");
const { fileHandlerRouter } = require("../../FileHandler/fileHandler");

const router = express.Router();

router.post(
  "/create",
  fileHandlerRouter("image", 0.5),
  subhDhanLabhController.createTicketCard
);

module.exports = router;
