const express = require("express");

const userActivityPageController=require('../../../../Controller/Pages/PiggyBox/pages')

const router = express.Router();

router.get('/',userActivityPageController.getUserActivityPage)

module.exports = router;
