const express = require("express");

const customerSupportPageController = require("../../../Controller/Pages/Admin/CustomerSupport/pages");

const router = express.Router();

router.get("/openCases", customerSupportPageController.getOpenCasesPage);
router.get("/closedCases", customerSupportPageController.getClosedCasesPage);
router.get("/pendingCases", customerSupportPageController.getPendingCasesPage);
router.get('/transferredCases',customerSupportPageController.getTransferredCasesPage);
router.get("/caseMessages/:caseId", customerSupportPageController.getCaseMessagesPage);
router.get("/dashboard", customerSupportPageController.getDashboardPage);

module.exports = router;
