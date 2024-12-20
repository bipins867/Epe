const express = require("express");

const piggyBoxController=require('../../../Controller/Pages/PiggyBox/pages')

const router = express.Router();

router.get('/closeAccountTermsAndConditions',piggyBoxController.getCloseAccountTermsAndConditionsPage)
router.get('/closeAccount',piggyBoxController.getCloseAccountPage)
router.get('/savedAddress',piggyBoxController.getSavedAddressPage)
router.get('/settlement',piggyBoxController.getSettlementPage)
router.get('/transferMoney',piggyBoxController.getTransferMoneyPage)
router.get('/loans',piggyBoxController.getLoansPage)
router.get('/referral',piggyBoxController.getReferralPage)
router.get('/requestWithdrawal',piggyBoxController.getRequestWithdrawalPage)
router.get('/kit',piggyBoxController.getKitPage)
router.get('/addFunds',piggyBoxController.getAddFundsPage)
router.get('/paymentStatus/:merchantTransactionId',piggyBoxController.getPaymentStatusPage)
router.get('/',piggyBoxController.getDashboardPage)

module.exports = router;
