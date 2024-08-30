const express=require('express')

const adminKycPageController=require('../../../Controller/Pages/Admin/Kyc/pages')
const adminKycController=require('../../../Controller/Admin/Kyc/kyc');
const { adminAuthentication } = require('../../../Middleware/auth');
const router=express.Router();


router.get('/dashboard',adminKycPageController.getKycDashboardPage)

router.get('/dashboard/:emailId', adminKycPageController.getUserDetailsPage);
router.get('/userDetails/:emailId',adminKycController.getUserDetails)

module.exports=router;