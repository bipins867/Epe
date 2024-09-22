const express=require('express')

const contactUsController=require('../../../../Controller/Admin/Basic/contactUs')

const router=express.Router();

router.post('/getCounts',contactUsController.getContactUsCounts)
router.post('/getPendingList',contactUsController.getPendingContactUs)
router.post('/contactUsInfo/:id',contactUsController.getContactUsInfo)
router.post('/getClosedList',contactUsController.getClosedContactUs)
router.post('/addAdminRemark/:id',contactUsController.addRemarkContactUs)



module.exports=router;