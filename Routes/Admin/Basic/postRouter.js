const express=require('express')
const router=express.Router();

const basicController=require('../../../Controller/Admin/Basic/basic')


router.post('/contactUs',basicController.updateContactUsByAdmin)
router.post('/applyLoan',basicController.updateApplyLoanByAdmin)

module.exports=router;