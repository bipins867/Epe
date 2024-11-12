const express = require("express");

const subhDhanLabhController = require("../../../Controller/Users/SubhDhanLabh/subhDhanLabh");

const router = express.Router();

router.get("/ticketCardLists", subhDhanLabhController.getTicketCardList);
router.get("/userTicketInfo", subhDhanLabhController.getUserTicketInfo);
router.post(
  "/getUserTicketReferral",
  subhDhanLabhController.getUserTicketReferrallList
);
router.post("/activateTicketCard", subhDhanLabhController.activateTicketCard);
// router.post(
//   "/activateMultipleTimesTicketCard",
//   subhDhanLabhController.activateMultipleTimesTicketCard
// );

module.exports = router;
