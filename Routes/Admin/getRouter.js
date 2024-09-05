const express = require("express");

const adminPageController = require("../../Controller/Pages/Admin/pages");
const dashboardController = require("../../Controller/Admin/Dashboard/dashboard");
const {
  adminAuthentication,
  roleSAuthentication,
} = require("../../Middleware/auth");
const adminController = require("../../Controller/Admin/admins");

const router = express.Router();



router.get("/login", adminPageController.getLoginPage);
router.get("/dashboard", adminPageController.getDashboardPage);
router.get(
  "/editAdmin",

  adminPageController.getEditAdminPage
);
router.get(
  "/editUserAdmin",

  adminPageController.getEditUserAdminPage
);

router.get(
  "/dashboardInfo",
  adminAuthentication,
  dashboardController.getDashboardInfo
);
router.get(
  "/adminList",
  adminAuthentication,
  roleSAuthentication,
  adminController.getAdminList
);

module.exports = router;
