
const express=require('express')


const postRouter=require('./postRouter');

const kitRouter=require('./Kit/kit')
const referralRouter=require('./Referral/referall')
const requestWithdrawalRouter=require('./RequestWithdrawal/requestWithdrawal')
const savedAddressRouter=require('./SavedAddress/savedAddress')
const settlementRouter=require('./Settlement/settlement')
const transferMoneyRouter=require('./TransferMoney/transferMoney')
const userActivityRouter=require('./UserActivity/userActivity')


const { userAuthentication } = require('../../../Middleware/auth');

const router=express.Router();

router.use('/kit',kitRouter)
router.use('/referral',referralRouter)
router.use('/requestWithdrawal',userAuthentication,requestWithdrawalRouter)
router.use('/savedAddress',userAuthentication,savedAddressRouter)
router.use('/settlement',userAuthentication,settlementRouter)
router.use('/transferMoney',userAuthentication,transferMoneyRouter)
router.use('/userActivity',userAuthentication,userActivityRouter)

router.use('/',postRouter);


module.exports=router;
