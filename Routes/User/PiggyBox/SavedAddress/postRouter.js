const express = require("express");

const savedAddressController=require('../../../../Controller/Users/PiggyBox/savedAddress');
const { userInfoVerification } = require("../../../../Middleware/auth");


const router = express.Router();

router.post('/addressInfo',savedAddressController.getSavedAddress)
router.post('/updateAddressInfo',userInfoVerification,savedAddressController.updateSavedAddress)

module.exports = router;
