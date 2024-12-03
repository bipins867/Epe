const express = require("express");

const kitController=require('../../../../Controller/Users/PiggyBox/kit');
const { userAuthentication } = require("../../../../Middleware/auth");

const router = express.Router();

router.post('/userInfo',userAuthentication,kitController.getUserInfo)

module.exports = router;
