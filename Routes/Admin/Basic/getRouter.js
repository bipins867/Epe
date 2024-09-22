const express=require('express')

const basicPageController=require('../../../Controller/Pages/Admin/Basic/pages')


const router=express.Router();


router.get('/applyLoan',basicPageController.getApplyLoanDashobard)
router.get('/contactUs',basicPageController.getContactUsDashobard)

router.get('/openApplyLoanList',basicPageController.getOpenApplyLoanList)
router.get('/openContactUsList',basicPageController.getOpenContactUsList)

router.get('/closeApplyLoanList',basicPageController.getCloseApplyLoanList)
router.get('/closeContactUsList',basicPageController.getCloseContactUsList)

router.get('/pendingApplyLoan/:id',basicPageController.getPendingApplyLoan)
router.get('/pendingContactUs/:id',basicPageController.getPendingContactUs)


router.get('/closeApplyLoan/:id',basicPageController.getCloseApplyLoan)
router.get('/closeContactUs/:id',basicPageController.getCloseContactUs)





module.exports=router;