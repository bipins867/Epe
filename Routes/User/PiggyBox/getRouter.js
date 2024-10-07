const express = require("express");

const piggyBoxController=require('../../../Controller/Pages/PiggyBox/pages')

const router = express.Router();

router.get('/requestWithdrawal',piggyBoxController.getRequestWithdrawalPage)
router.get('/kit',piggyBoxController.getKitPage)
router.get('/',piggyBoxController.getDashboardPage)

module.exports = router;
