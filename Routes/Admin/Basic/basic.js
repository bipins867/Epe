const express=require('express')
const getRouter=require('./getRouter')
const postRouter=require('./postRouter');
const applyLoanRouter=require('./ApplyLoan/applyLoan')
const contactUsRouter=require('./ContactUs/contactUs')
const announcementRouter=require('./Announcement/announcement');
const { adminAuthentication } = require('../../../Middleware/auth');


const router=express.Router();

router.use('/announcement',announcementRouter)
router.use('/applyLoan',applyLoanRouter)
router.use('/contactUs',contactUsRouter)
router.use('/post',adminAuthentication,postRouter)
router.use('/',getRouter)

module.exports=router;
