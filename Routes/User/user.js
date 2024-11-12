
const express=require('express')

const dashboardRouter=require('./Dashboard/dashoard')
const kycRouter=require('./Kyc/kyc')
const authRouter=require('./Auth/auth');
const piggyBoxRouter=require('./PiggyBox/piggyBox')
const subhDhanLabhRouter=require('./SubhDhanLabh/subhDhanLabh')


const router=express.Router();

router.use('/subhDhanLabh',subhDhanLabhRouter)
router.use('/piggyBox',piggyBoxRouter)
router.use('/auth',authRouter)
router.use('/kyc',kycRouter)
router.use('/dashboard',dashboardRouter);

module.exports=router;