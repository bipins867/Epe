const express = require("express");

const announcementPageController = require("../../../../Controller/Pages/Admin/Basic/pages");

const router = express.Router();

router.get("/", announcementPageController.getAnnouncementPage);

module.exports = router;
