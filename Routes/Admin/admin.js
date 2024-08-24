
const express=require('express')
const getRouter=require('./getRouter')
const router=express.Router();

router.use('/',getRouter)

module.exports=router;
