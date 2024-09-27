const express = require("express");

const customerSupportController=require('../../../Controller/Admin/CustomerSupport/customerSupport');
const { verifyAdminAssociation, verifyAdminAssociationByParams } = require("../../../Middleware/chatSupport");

const router = express.Router();

router.post('/dashboardInfo',customerSupportController.getDashboardInfo)
router.post('/openCases',customerSupportController.getOpenCases)
router.post('/closedCases',customerSupportController.getClosedCases)
router.post('/pendingCases',customerSupportController.getPendingCases)
router.post('/transferredCases',customerSupportController.getTransferedCases)
router.post('/caseInfo/:caseId',customerSupportController.getCaseInfo)
router.post('/caseMessages/:caseId',customerSupportController.getCaseMessages)
router.post('/addMessage',verifyAdminAssociation,customerSupportController.addAdminMessage)
router.post('/closeCase',verifyAdminAssociation,customerSupportController.closeCaseByAdmin)
router.post('/addAdminToCase',customerSupportController.addAdminToCase)
router.post('/transferCase',customerSupportController.transferCase)


module.exports = router;
