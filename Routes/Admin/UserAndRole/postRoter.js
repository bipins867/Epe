const express = require("express");
const router = express.Router();

const userAndRoleController = require("../../../Controller/Admin/UserAndRole/userAndRole");
const {
  adminAuthentication,
  roleSSAuthentication,
  roleSAuthentication,
} = require("../../../Middleware/auth");


router.post("/createSSAdmin", userAndRoleController.createSSAdmin);
router.post(
  "/createSAdmin",
  adminAuthentication,
  roleSSAuthentication,
  userAndRoleController.createSAdmin
);
router.post(
  "/createAdmin",
  adminAuthentication,
  roleSAuthentication,
  userAndRoleController.createAdmin
);

router.post(
  "/deleteAdmin/:userName",
  adminAuthentication,
  roleSAuthentication,
  userAndRoleController.deleteAdmin
);

router.post(
  "/changePassword",
  adminAuthentication,
  roleSAuthentication,
  userAndRoleController.changePassword
);

router.post("/updateAdminStatus",adminAuthentication,roleSAuthentication, userAndRoleController.updateAdminStatus);

router.post("/updateAdminRoles",adminAuthentication,roleSAuthentication, userAndRoleController.updateAdminRoles);

router.post("/createRole", userAndRoleController.createRole);
router.post("/deleteRole", userAndRoleController.deleteRole);

router.post(
  "/getRolesList",
  adminAuthentication,
  userAndRoleController.getRolesList
);
module.exports = router;
