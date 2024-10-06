const express = require("express");

const kitController=require('../../../../Controller/Users/PiggyBox/kit')

const router = express.Router();

router.get('/userInfo',kitController.getUserInfo)

module.exports = router;
