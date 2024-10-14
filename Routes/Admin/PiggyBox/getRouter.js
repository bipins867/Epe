const express = require("express");

const piggyBoxPageController=require('../../../Controller/Pages/Admin/PiggyBox/PiggyBox/pages')

const router = express.Router();

router.get('/manageFunds',piggyBoxPageController.getManageFundsPage)
router.get('/',piggyBoxPageController.getDashboardPage)

module.exports = router;