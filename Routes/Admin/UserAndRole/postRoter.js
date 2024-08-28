const express = require("express");
const router = express.Router();

const userAndRoleController = require("../../../Controller/Admin/UserAndRole/userAndRole");
const {
  adminAuthentication,
  userAuthentication,
} = require("../../../Middleware/auth");

router.post("/createSSAdmin", userAndRoleController.createSSAdmin);
router.post("/createSAdmin", userAndRoleController.createSAdmin);
router.post("/createAdmin", userAndRoleController.createAdmin);

router.post(
  "/deleteAdmin/:userName",
  adminAuthentication,
  userAndRoleController.deleteAdmin
);

router.post(
  "/changePassword",
  adminAuthentication,
  userAndRoleController.changePassword
);

router.post("/updateAdminStatus", userAndRoleController.updateAdminStatus);


router.post('/updateAdminRoles',userAndRoleController.updateAdminRoles)

router.post("/createRole", userAndRoleController.createRole);
router.post("/deleteRole", userAndRoleController.deleteRole);

router.post('/getRolesList',adminAuthentication,userAndRoleController.getRolesList)
module.exports = router;
