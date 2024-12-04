
const express=require('express')

const getRouter=require('./getRouter')
const postRouter=require('./postRouter');
const { userAuthentication, userInfoVerification } = require('../../../Middleware/auth');

const router=express.Router();

router.use('/post',userAuthentication,userInfoVerification,postRouter);
router.use('/',getRouter)

module.exports=router;
