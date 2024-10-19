const express=require('express')
const router=express.Router();

const basicController=require('../../Controller/Basic/basic')


router.post('/contactUs',basicController.submitContactUs)
router.post('/applyLoan',basicController.submitApplyLoan)
router.post('/subscribeNewsLetter',basicController.subscribeToNewsletter)
router.post('/getAllActiveAnnouncments',basicController.getAllActiveAnnouncments)

module.exports=router;