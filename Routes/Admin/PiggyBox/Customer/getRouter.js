const express = require("express");

const customerPageController = require("../../../../Controller/Pages/Admin/PiggyBox/Customer/pages");

const router = express.Router();

router.get("/editCustomer/:candidateId", customerPageController.getEditCustomerPage);
router.get("/customerList", customerPageController.getCustomerListPage);
router.get("/", customerPageController.getDashboardPage);

module.exports = router;
