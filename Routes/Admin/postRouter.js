const express = require("express");

const authController = require("../../Controller/Admin/Auth/auth");
const activityController=require('../../Controller/Admin/Auth/adminActivity');


const router = express.Router();


router.post('/login',authController.adminLogin)
router.post('/getAdminActivity',activityController.getAdminActivityHistory)

module.exports = router;
