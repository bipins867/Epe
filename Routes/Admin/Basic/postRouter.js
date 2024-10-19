const express=require('express')
const router=express.Router();

const basicController=require('../../../Controller/Admin/Basic/basic');
const { contactUsRole, applyLoanRole } = require('../../../Middleware/role');
const { roleAuthentication } = require('../../../Middleware/auth');


router.post('/contactUs',contactUsRole,roleAuthentication,basicController.updateContactUsByAdmin)
router.post('/applyLoan',applyLoanRole,roleAuthentication,basicController.updateApplyLoanByAdmin)

module.exports=router;