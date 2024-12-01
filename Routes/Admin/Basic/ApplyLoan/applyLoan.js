const express=require('express')

const applyLoanController=require('../../../../Controller/Admin/Basic/applyLoan')


const router=express.Router();


router.post('/getCounts',applyLoanController.getApplyLoanCounts)
router.post('/getPendingList',applyLoanController.getPendingApplyLoan)
router.post('/applyLoanInfo/:id',applyLoanController.getApplyLoanInfo)
router.post('/getClosedList',applyLoanController.getClosedApplyLoan)
router.post('/addAdminRemark/:id',applyLoanController.addRemarkApplyLoan)

module.exports=router;