const TicketCard = require("../../../Models/SubhDhanLabh/ticketCard");
const UserTicketCard = require("../../../Models/SubhDhanLabh/userTicketCard");
const { createUserActivity } = require("../../../Utils/activityUtils");
const Sequelize = require("sequelize");
const sequelize = require("../../../database");
const Piggybox = require("../../../Models/PiggyBox/piggyBox");

exports.getTicketCardList = async (req, res, next) => {
  try {
    // Find all TicketCards where isActive is true
    const activeTickets = await TicketCard.findAll({
      where: { isActive: true },
    });

    // Return the active ticket cards
    return res.status(200).json({
      message: "Active ticket cards retrieved successfully.",
      tickets: activeTickets,
    });
  } catch (error) {
    console.error("Error fetching active ticket cards:", error);
    return res.status(500).json({
      message: "An error occurred while fetching active ticket cards.",
    });
  }
};

exports.getUserTicketInfo = async (req, res, next) => {};

exports.getUserTicketReferallList = async (req, res, next) => {};

exports.activateTicketCard = async (req, res, next) => {
  const { title } = req.body;
  const userId = req.user.id;
  // Start a sequelize transaction
  let transaction;
  try {
    // Find the requested TicketCard by title
    const ticketCard = await TicketCard.findOne({ where: { title } });
    if (!ticketCard) {
      return res.status(404).json({ message: "Ticket card not found." });
    }

    // Check if the user already has an associated UserTicketCard for this TicketCard
    let userTicketCard = await UserTicketCard.findOne({
      where: { UserId: userId, TicketCardId: ticketCard.id },
    });

    // Check if the ticket is already active for this user
    if (userTicketCard && userTicketCard.isTicketActive) {
      return res.status(400).json({ message: "Ticket is already active." });
    }

    transaction = await sequelize.transaction();

    // If no UserTicketCard exists, create it with default values
    if (!userTicketCard) {
      userTicketCard = await UserTicketCard.create(
        {
          UserId: userId,
          TicketCardId: ticketCard.id,
          isTicketActive: false,
          isFundedFirst: false,
          isCompleted: false,
          rechargeCount: 0,
          affiliateBonus: 0,
          goldBonus: 0,
        },
        { transaction }
      );
    }

    // Fetch user's Piggybox to check balance
    const piggybox = await Piggybox.findOne({ where: { UserId: userId } });
    if (!piggybox || piggybox.piggyBalance < ticketCard.price) {
      await transaction.commit(); // Commit if UserTicketCard was created but no sufficient balance
      return res.status(400).json({ message: "Insufficient funds in wallet." });
    }

    // Deduct the ticket price from user's Piggybox balance
    const newPiggyBalance =
      parseFloat(piggybox.piggyBalance) - parseFloat(ticketCard.price);
    await piggybox.update({ piggyBalance: newPiggyBalance }, { transaction });

    // Create a TransactionHistory record
    await createTransactionHistory(
      {
        UserId: userId,
        merchantTransactionId: null,
        merchantUserId: null,
        transactionType: "subDhanLabh",
        remark: `User purchased ${ticketCard.title} of Amount:- ${ticketCard.price}`,
        credit: 0,
        debit: ticketCard.price,
        balance: newPiggyBalance,
      },
      transaction
    );

    // Update UserTicketCard to activate the ticket and increment rechargeCount
    await userTicketCard.update(
      {
        isTicketActive: true,
        isFundedFirst: true,
        rechargeCount: userTicketCard.rechargeCount + 1,
      },
      { transaction }
    );

    // Create a user activity log
    await createUserActivity(
      req,
      req.user,
      "subhDhanLabh",
      `User ${req.user.userName} activated the ticket ${ticketCard.title}`,
      transaction
    );

    // Commit the transaction
    await transaction.commit();
    res.status(200).json({ message: "Ticket activated successfully." });
  } catch (error) {
    // Rollback in case of any error
    if (transaction) await transaction.rollback();
    console.error("Error activating ticket card:", error);
    res
      .status(500)
      .json({ message: "An error occurred while activating the ticket." });
  }
};

exports.activateForAllTicketCard = async (req, res, next) => {};
