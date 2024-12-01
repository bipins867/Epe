
const express=require('express')
const getRouter=require('./getRouter')
const postRouter=require('./auth')
const router=express.Router();


router.use('/post',postRouter)
router.use('/',getRouter)
module.exports=router;
