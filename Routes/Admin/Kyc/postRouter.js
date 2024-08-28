const express=require('express')
const adminKycController=require('../../../Controller/Admin/Kyc/kyc')


const router=express.Router();

router.post('/updateStatus',adminKycController.updateKycStatus)


module.exports=router;