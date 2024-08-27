
const express=require('express')

const dashboardRouter=require('./Dashboard/dashoard')
const kycRouter=require('./Kyc/kyc')


const router=express.Router();

router.use('/kyc',kycRouter)
router.use('/dashboard',dashboardRouter);

module.exports=router;