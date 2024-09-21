const express=require('express')

const basicPageController=require('../../../Controller/Pages/Admin/Basic/pages')


const router=express.Router();


router.get('/applyLoan',basicPageController.getApplyLoanDashobard)
router.get('/contactUs',basicPageController.getContactUsDashobard)

router.get('/openApplyLoan',basicPageController.getOpenApplyLoan)
router.get('/openContactUs',basicPageController.getOpenContactUs)

router.get('/pendingApplyLoan',basicPageController.getPendingApplyLoan)
router.get('/pendingContactUs',basicPageController.getPendingContactUs)


router.get('/closeApplyLoan',basicPageController.getCloseApplyLoan)
router.get('/closeContactUs',basicPageController.getCloseContactUs)





module.exports=router;