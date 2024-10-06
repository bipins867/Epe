const express = require("express");

const kitController=require('../../../../Controller/Users/PiggyBox/kit')

const router = express.Router();

router.post('/userInfo',kitController.getUserInfo)

module.exports = router;
