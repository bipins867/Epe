
const express=require('express')

const getRouter=require('./getRouter')
const postRouter=require('./postRouter');
const { userAuthentication } = require('../../../../Middleware/auth');

const router=express.Router();

router.use('/post',userAuthentication,postRouter);
router.use('/',getRouter)

module.exports=router;
