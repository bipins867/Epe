const express = require("express");

const userActivityController=require('../../../../Controller/Users/PiggyBox/userActivity');
const { userAuthentication } = require("../../../../Middleware/auth");

const router = express.Router();

router.post('/getUserActivity',userAuthentication,userActivityController.getUserActivity)

module.exports = router;
