const express=require('express')
const getRouter=require('./getRouter')
const postRouter=require('./postRouter');
const applyLoanRouter=require('./ApplyLoan/applyLoan')
const contactUsRouter=require('./ContactUs/contactUs')


const router=express.Router();

router.use('/applyLoan',applyLoanRouter)
router.use('/contactUs',contactUsRouter)
router.use('/post',postRouter)
router.use('/',getRouter)

module.exports=router;
