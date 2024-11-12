const express = require("express");

const pageController=require('../../../Controller/Pages/PiggyBox/pages')

const router = express.Router();

router.get('/dashboard',pageController.getSubhDhanLabhPage)
router.get('/ticketCardInfo/:ticketTitle',pageController.getTicketCardInfoPage)

module.exports = router;
