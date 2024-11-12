const TicketCard = require("../../../Models/SubhDhanLabh/ticketCard");
const UserTicketCard = require("../../../Models/SubhDhanLabh/userTicketCard");
const { createUserActivity } = require("../../../Utils/activityUtils");
const Sequelize = require("sequelize");
const sequelize = require("../../../database");
const Piggybox = require("../../../Models/PiggyBox/piggyBox");
const User = require("../../../Models/User/users");
const Referrals = require("../../../Models/PiggyBox/referrals");
const ReferredUser = require("../../../Models/PiggyBox/referredUsers");
const {
  SUBH_DHAN_LABH_USER_COUNT,
  SUBH_DHAN_LABH_PERCENTAGE_DISTRIBUTION,
} = require("../../../importantSetup");
const { sendCreditMessage } = require("../../../Utils/MailService");
const TransactionHistory = require("../../../Models/PiggyBox/transactionHistory");

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

exports.getUserTicketInfo = async (req, res, next) => {
  try {
    // Step 1: Retrieve the user ID from the request (assuming user is authenticated and ID is attached to the request)
    const userId = req.user.id;

    // Step 2: Get the list of TicketCards
    const ticketCards = await TicketCard.findAll();

    // Step 3: For each TicketCard, retrieve associated UserTicketCard information for the user
    const userTicketInfo = await Promise.all(
      ticketCards.map(async (ticketCard) => {
        const userTicketCard = await UserTicketCard.findOne({
          where: {
            UserId: userId,
            TicketCardId: ticketCard.id,
          },
        });

        return {
          ticketCard: ticketCard,
          userTicketCard: userTicketCard ? userTicketCard : null, // Null if no UserTicketCard exists for this TicketCard
        };
      })
    );

    // Step 4: Respond with the list of TicketCards and associated UserTicketCard info
    res.status(200).json({
      success: true,
      data: userTicketInfo,
    });
  } catch (error) {
    console.error("Error fetching user ticket information:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user ticket information",
    });
    next(error);
  }
};

exports.getUserTicketReferrallList = async (req, res, next) => {
  const { ticketTitle } = req.body;

  try {
    // Find the requested TicketCard by ticketTitle
    const ticketCard = await TicketCard.findOne({
      where: { title: ticketTitle },
    });
    if (!ticketCard) {
      return res.status(404).json({ message: "Ticket card not found." });
    }

    // Step 1: Retrieve the user ID from the request (assuming user is authenticated)
    const userId = req.user.id;

    // Step 2: Get referral information for the user
    const referralInfo = await Referrals.findOne({ where: { UserId: userId } });
    if (!referralInfo) {
      return res.status(404).json({
        success: false,
        message: "No referral information found for this user",
      });
    }

    // Step 3: Find all ReferredUsers associated with this referral
    const referredUsers = await ReferredUser.findAll({
      where: { ReferralId: referralInfo.id },
      include: [{ model: User, as: "user" }],
    });

    // Step 4: Classify referred users into three categories
    const notActivatedUsers = [];
    const activeButNotCompletedUsers = [];
    const completedUsers = [];

    for (const referredUser of referredUsers) {
      const referredUserInfo = referredUser.user;
      if (!referredUserInfo) continue;

      // Fetch the UserTicketCard for each referred user
      const userTicketCard = await UserTicketCard.findOne({
        where: { UserId: referredUserInfo.id, TicketCardId: ticketCard.id },
      });

      // Categorize based on UserTicketCard status
      if (!userTicketCard || userTicketCard.rechargeCount === 0) {
        // User who hasn't activated the wallet
        notActivatedUsers.push({
          candidateId: referredUserInfo.candidateId,
          name: referredUserInfo.name,
          email: referredUserInfo.email,
          phone: referredUserInfo.phone,
          ticketStatus: "Not Activated",
        });
      } else if (userTicketCard.isFundedFirst && !userTicketCard.isCompleted) {
        // User with an active wallet but not yet completed
        activeButNotCompletedUsers.push({
          candidateId: referredUserInfo.candidateId,
          name: referredUserInfo.name,
          email: referredUserInfo.email,
          phone: referredUserInfo.phone,
          ticketStatus: "Active but Not Completed",
        });
      } else if (userTicketCard.isCompleted) {
        // User with completed status
        completedUsers.push({
          candidateId: referredUserInfo.candidateId,
          name: referredUserInfo.name,
          email: referredUserInfo.email,
          phone: referredUserInfo.phone,
          ticketStatus: "Completed",
        });
      }
    }

    // Step 5: Respond with the categorized lists
    res.status(200).json({
      success: true,
      data: {
        notActivatedUsers,
        activeButNotCompletedUsers,
        completedUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching user ticket referral list:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user ticket referral list",
    });
    next(error);
  }
};

exports.activateTicketCard = async (req, res, next) => {
  const { ticketTitle } = req.body;
  const userId = req.user.id;
  const user=req.user;
  // Start a sequelize transaction
  let transaction;
  try {
    if (!ticketTitle) {
      return res
        .status(404)
        .json({ error: "Ticket Card information not found!" });
    }
    // Find the requested TicketCard by ticketTitle
    const ticketCard = await TicketCard.findOne({
      where: { title: ticketTitle },
    });
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
    await TransactionHistory.create(
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

    if (req.user.byReferralId != null && !userTicketCard.isCompleted) {
      await updateTopUserInfo(user.byReferralId, ticketCard.title, transaction);
    }

    await updateBelowUserInfo(req.user, ticketCard.title, transaction);

    // Commit the transaction
    await transaction.commit();
    res.status(200).json({ message: "Ticket activated successfully." });
  } catch (error) {
    // Rollback in case of any error
    if (transaction) await transaction.rollback();
    console.error("Error activating ticket card:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error! in activating the ticket" });
  }
};

exports.activateMultipleTimesTicketCard = async (req, res, next) => {
  try {
    // Step 1: Retrieve the user ID and ticket title from the request
    const userId = req.user.id;
    const { ticketTitle } = req.body;

    // Step 2: Find the user's TicketCard by title
    const ticketCard = await TicketCard.findOne({
      where: { title: ticketTitle },
    });
    if (!ticketCard) {
      return res
        .status(404)
        .json({ success: false, message: "TicketCard not found" });
    }

    // Step 3: Retrieve the UserTicketCard and check if it's already activated
    const userTicketCard = await UserTicketCard.findOne({
      where: { UserId: userId, TicketCardId: ticketCard.id },
    });

    if (!userTicketCard || !userTicketCard.isTicketActive) {
      return res.status(400).json({
        success: false,
        message:
          "User must activate the ticket for the first time before re-activating.",
      });
    }

    // Step 4: Get associated piggyBox and referral info
    const piggyBox = await Piggybox.findOne({ where: { UserId: userId } });
    const referralInfo = await Referrals.findOne({ where: { UserId: userId } });
    if (!referralInfo) {
      return res.status(404).json({
        success: false,
        message: "No referral information found for this user",
      });
    }

    // Step 5: Get ReferredUsers who have funded but not completed their TicketCard
    const referredUsers = await ReferredUser.findAll({
      where: { ReferralId: referralInfo.id },
      include: [{ model: User, as: "user" }],
    });

    const activeReferredUsers = [];
    for (const referredUser of referredUsers) {
      const referredUserInfo = referredUser.user;
      if (!referredUserInfo) continue;

      const referredUserTicketCard = await UserTicketCard.findOne({
        where: {
          UserId: referredUserInfo.id,
          isFundedFirst: true,
          isCompleted: false,
          TicketCardId: ticketCard.id,
        },
      });

      if (referredUserTicketCard) {
        activeReferredUsers.push(referredUserTicketCard);
      }
    }

    // Step 6: Calculate total group pairs
    const userCount = activeReferredUsers.length;
    const resultantUserCount = parseInt(userCount / SUBH_DHAN_LABH_USER_COUNT);
    const requiredBalance = resultantUserCount * ticketCard.price;

    // Step 7: Check if piggyBox balance is sufficient
    if (piggyBox.piggyBalance < requiredBalance) {
      return res.status(400).json({
        success: false,
        message: "Insufficient funds in PiggyBox to activate all TicketCards",
      });
    }

    // Step 8: Begin transaction and update piggyBox balance
    await sequelize.transaction(async (transaction) => {
      // Deduct balance from piggyBox
      const newPiggyBoxBalance = piggyBox.piggyBalance - requiredBalance;
      await piggyBox.update(
        { piggyBalance: newPiggyBoxBalance },
        { transaction }
      );

      // Step 9: Create TransactionHistory entry with custom message
      await TransactionHistory.create(
        {
          UserId: userId,
          transactionType: "activation",
          remark: `${ticketTitle} - Re-activating wallet as this ticket was previously activated.`,
          credit: 0,
          debit: requiredBalance,
          balance: newPiggyBoxBalance,
          merchantTransactionId: null,
          merchantUserId: null,
        },
        { transaction }
      );

      // Step 10: Update UserTicketCard recharge count
      await userTicketCard.update(
        { rechargeCount: userTicketCard.rechargeCount + resultantUserCount },
        { transaction }
      );

      // Step 11: Update the oldest referred users to complete status
      const oldestReferredUsers = activeReferredUsers.slice(
        0,
        resultantUserCount * SUBH_DHAN_LABH_USER_COUNT
      );
      for (const referredUserTicket of oldestReferredUsers) {
        await referredUserTicket.update({ isCompleted: true }, { transaction });
      }
    });

    res.status(200).json({
      success: true,
      message:
        "TicketCard re-activated successfully, and associated referred users updated.",
    });
  } catch (error) {
    console.error("Error in activateForAllTicketCard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to activate TicketCard for all referred users.",
    });
    next(error);
  }
};

//---------------------------
async function updateTopUserInfo(byReferralId, ticketTitle, transaction) {
  try {
    // Step 1: Find the user by referral ID
    const user = await User.findOne({ where: { byReferralId } });
    if (!user) return;

    // Step 2: Get the ticket card information by title
    const ticketCard = await TicketCard.findOne({
      where: { title: ticketTitle },
    });
    if (!ticketCard) return;

    // Step 3: Find or create UserTicketCard for this user and the specified TicketCard
    let userTicketCard = await UserTicketCard.findOne({
      where: { UserId: user.id, ticketCardId: ticketCard.id },
    });

    if (!userTicketCard) {
      userTicketCard = await UserTicketCard.create(
        {
          UserId: user.id,
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

    // Step 4: If UserTicketCard exists but is not active, exit
    if (!userTicketCard.isTicketActive) return;

    // Step 5: Find user referrals by user ID
    const userReferrals = await Referrals.findOne({
      where: { UserId: user.id },
    });

    // Step 6: Find associated ReferredUsers for this referral
    const referredUsers = await ReferredUser.findAll({
      where: { ReferralId: userReferrals.id },
      include: [{ model: User, as: "user" }],
    });

    // Step 7: Filter for ReferredUsers with a funded and incomplete UserTicketCard
    const activeReferredUsers = [];

    for (const referredUser of referredUsers) {
      const referredUserInfo = referredUser.user;
      if (!referredUserInfo) continue;

      const referredUserTicketCard = await UserTicketCard.findOne({
        where: {
          UserId: referredUserInfo.id,
          isFundedFirst: true,
          isCompleted: false,
          TicketCardId: ticketCard.id,
        },
      });

      if (referredUserTicketCard) {
        activeReferredUsers.push(referredUserTicketCard);
      }
    }

    // Step 8: Check if active referred users meet the threshold
    const activeReferredUserCount = activeReferredUsers.length;
    if (activeReferredUserCount >= SUBH_DHAN_LABH_USER_COUNT) {
      // Set user's isTicketActive to false
      await userTicketCard.update({ isTicketActive: false }, { transaction });

      // Step 9: Update user piggyBox balance with calculated bonus
      const bonusAmount =
        SUBH_DHAN_LABH_USER_COUNT *
        ticketCard.price *
        (1 + SUBH_DHAN_LABH_PERCENTAGE_DISTRIBUTION / 100);

      const piggyBox = await Piggybox.findOne({
        where: { UserId: user.id },
        transaction,
      });

      const newPiggyBoxBalance =
        parseFloat(piggyBox.piggyBalance) + bonusAmount;
      await piggyBox.update(
        { piggyBalance: newPiggyBoxBalance },
        { transaction }
      );

      // Step 10: Create TransactionHistory entry for the bonus
      const thistory = await TransactionHistory.create(
        {
          UserId: user.id,
          transactionType: "subDhanLabh",
          remark: `${ticketTitle} - Bonus added`,
          credit: bonusAmount,
          debit: 0,
          balance: newPiggyBoxBalance,
          merchantTransactionId: null,
          merchantUserId: null,
        },
        { transaction }
      );

      // Step 11: Update oldest active referred users to isCompleted = true
      const oldestReferredUsers = activeReferredUsers.slice(
        0,
        SUBH_DHAN_LABH_USER_COUNT
      );

      for (const referredUserTicket of oldestReferredUsers) {
        await referredUserTicket.update({ isCompleted: true }, { transaction });
      }

      sendCreditMessage(
        user.phone,
        bonusAmount.toFixed(2),
        user.candidateId,
        `REF-35${thistory.id}`,
        piggyBox.piggyBalance.toFixed(2)
      );
    }
  } catch (error) {
    console.error("Error updating top user information:", error);
    throw error;
  }
}
//Updating below lever user information
async function updateBelowUserInfo(user, ticketTitle, transaction) {
  try {
    const ticketCard = await TicketCard.findOne({
      where: { title: ticketTitle },
    });
    // Step 1: Find user referrals by user ID
    const userReferrals = await Referrals.findOne({
      where: { UserId: user.id },
    });
    if (!userReferrals) return;

    // Step 2: Find associated ReferredUsers for this referral
    const referredUsers = await ReferredUser.findAll({
      where: { ReferralId: userReferrals.id },
      include: [{ model: User, as: "user" }], // Fetch User info for each ReferredUser
      transaction,
    });

    // Step 3: Filter for ReferredUsers with a funded and incomplete UserTicketCard
    const activeReferredUsers = [];

    for (const referredUser of referredUsers) {
      const referredUserInfo = referredUser.user;
      if (!referredUserInfo) continue;

      const referredUserTicketCard = await UserTicketCard.findOne({
        where: {
          UserId: referredUserInfo.id,
          isFundedFirst: true,
          isCompleted: false,
          TicketCardId: ticketCard.id,
        },
        transaction,
      });

      if (referredUserTicketCard) {
        activeReferredUsers.push(referredUserTicketCard);
      }
    }

    // Step 4: Check if active referred users meet the threshold
    const activeReferredUserCount = activeReferredUsers.length;
    if (activeReferredUserCount >= SUBH_DHAN_LABH_USER_COUNT) {
      // Step 5: Set user's isTicketActive to false
      const userTicketCard = await UserTicketCard.findOne({
        where: { UserId: user.id, ticketCardId: ticketCard.id },
        transaction,
      });
      await userTicketCard.update({ isTicketActive: false }, { transaction });

      // Step 6: Update user piggyBox balance with calculated bonus
      const bonusAmount =
        SUBH_DHAN_LABH_USER_COUNT *
        ticketCard.price *
        (1 + SUBH_DHAN_LABH_PERCENTAGE_DISTRIBUTION / 100);

      const piggyBox = await Piggybox.findOne({
        where: { UserId: user.id },
        transaction,
      });

      const newPiggyBoxBalance =
        parseFloat(piggyBox.piggyBalance) + bonusAmount;
      await piggyBox.update(
        { piggyBalance: newPiggyBoxBalance },
        { transaction }
      );

      // Step 7: Create TransactionHistory entry for the bonus
      const thistory = await TransactionHistory.create(
        {
          UserId: user.id,
          transactionType: "subDhanLabh",
          remark: `${ticketTitle} - Bonus added`,
          credit: bonusAmount,
          debit: 0,
          balance: newPiggyBoxBalance,
          merchantTransactionId: null,
          merchantUserId: null,
        },
        { transaction }
      );

      // Step 8: Update oldest active referred users to isCompleted = true
      const oldestReferredUsers = activeReferredUsers.slice(
        0,
        SUBH_DHAN_LABH_USER_COUNT
      );

      for (const referredUserTicket of oldestReferredUsers) {
        await referredUserTicket.update({ isCompleted: true }, { transaction });
      }

      // Step 9: Send a credit message to the user
      sendCreditMessage(
        user.phone,
        bonusAmount.toFixed(2),
        user.candidateId,
        `REF-35${thistory.id}`,
        piggyBox.piggyBalance.toFixed(2)
      );
    }
  } catch (error) {
    console.error("Error updating below user information:", error);
    throw error;
  }
}
