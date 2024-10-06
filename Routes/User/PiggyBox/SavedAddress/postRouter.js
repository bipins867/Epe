const express = require("express");

const savedAddressController=require('../../../../Controller/Users/PiggyBox/savedAddress')


const router = express.Router();

router.post('/addressInfo',savedAddressController.getSavedAddress)
router.post('/updateAddressInf',savedAddressController.updateSavedAddress)

module.exports = router;
