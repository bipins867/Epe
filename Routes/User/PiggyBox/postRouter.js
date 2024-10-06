const express = require("express");

const piggyBoxController=require('../../../Controller/Users/PiggyBox/piggyBox')

const router = express.Router();

router.post('/getPiggyBoxInfo',piggyBoxController.getPiggyBoxInfo)
router.post('/getTransactionHistory',piggyBoxController.getTransactionHistory)

module.exports = router;
