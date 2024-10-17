
const express=require('express')

const getRouter=require('./getRouter')
const postRouter=require('./postRouter');
const { adminAuthentication, roleAuthentication } = require('../../../../Middleware/auth');
const { requestWithdrawalRole } = require('../../../../Middleware/role');



const router=express.Router();


router.use('/post',adminAuthentication,requestWithdrawalRole,roleAuthentication,adminAuthentication,postRouter)
router.use('/',getRouter)

module.exports=router;
