const express=require('express')

const adminKycController=require('../../../Controller/Pages/Admin/Kyc/pages')

const router=express.Router();


router.get('/dashboard',adminKycController.getKycDashboardPage)

router.get('/dashboard/:userId', adminKycController.getUserDetailsPage);


module.exports=router;