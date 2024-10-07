
const express=require('express')

const getRouter=require('./getRouter')
const postRouter=require('./postRouter');

const kitRouter=require('./Kit/kit')
const referralRouter=require('./Referral/referall')
const requestWithdrawalRouter=require('./RequestWithdrawal/requestWithdrawal')
const savedAddressRouter=require('./SavedAddress/savedAddress')
const settlementRouter=require('./Settlement/settlement')
const transferMoneyRouter=require('./TransferMoney/transferMoney')


const { userAuthentication } = require('../../../Middleware/auth');

const router=express.Router();

router.use('/kit',kitRouter)
router.use('/referral',referralRouter)
router.use('/requestWithdrawal',requestWithdrawalRouter)
router.use('/savedAddress',savedAddressRouter)
router.use('/settlement',settlementRouter)
router.use('/transferMoney',transferMoneyRouter)

router.use('/post',postRouter);
router.use('/',getRouter)

module.exports=router;
