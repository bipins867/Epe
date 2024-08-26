
const express=require('express')
const getRouter=require('./getRouter')
const kycRouter=require('./Kyc/kyc')
const router=express.Router();

router.use('/kyc',kycRouter)
router.use('/',getRouter)

module.exports=router;
