
const express=require('express')

const dashboardRouter=require('./Dashboard/dashboard')
const kycRouter=require('./Kyc/kyc')
const authRouter=require('./Auth/auth');
const piggyBoxRouter=require('./PiggyBox/piggyBox')
const subhDhanLabhRouter=require('./SubhDhanLabh/subhDhanLabh');
const { userAuthentication } = require('../../Middleware/auth');


const router=express.Router();

router.use('/subhDhanLabh',userAuthentication,subhDhanLabhRouter)
router.use('/piggyBox',piggyBoxRouter)
router.use('/auth',authRouter)
router.use('/kycAndPan',userAuthentication,kycRouter)
router.use('/dashboard',userAuthentication,dashboardRouter);

module.exports=router;