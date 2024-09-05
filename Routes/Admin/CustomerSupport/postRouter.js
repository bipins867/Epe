const express = require("express");

const customerSupportController=require('../../../Controller/Admin/CustomerSupport/customerSupport')

const router = express.Router();

router.post('/dashboardInfo',customerSupportController.getDashboardInfo)
router.post('/openCases',customerSupportController.getOpenCases)
router.post('/closedCases',customerSupportController.getClosedCases)
router.post('/pendingCases',customerSupportController.getPendingCases)
router.post('/caseInfo/:caseId',customerSupportController.getCaseInfo)
router.post('/caseMessages/:caseId',customerSupportController.getCaseMessages)
router.post('/addMessage',customerSupportController.addAdminMessage)
router.post('/closeCase',customerSupportController.closeCaseByAdmin)


module.exports = router;
