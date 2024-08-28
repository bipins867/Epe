
const express=require('express')
const getRouter=require('./getRouter')
const kycRouter=require('./Kyc/kyc')
const userAndRoleRouter=require('./UserAndRole/userAndRole')
const postRouter=require('./postRouter')

const router=express.Router();

router.use('/userAndRole',userAndRoleRouter)
router.use('/kyc',kycRouter)
router.use('/post',postRouter)
router.use('/',getRouter)

module.exports=router;
