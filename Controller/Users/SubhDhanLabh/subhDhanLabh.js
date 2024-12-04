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
  GST_PERCENTAGE,
} = require("../../../importantSetup");
const {
  sendCreditMessage,
  sendDebitMessage,
} = require("../../../Utils/MailService");
const TransactionHistory = require("../../../Models/PiggyBox/transactionHistory");
const PurchaseHistory = require("../../../Models/SubhDhanLabh/purchaseHistory");

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
    console.log(error);
  }
};

exports.getUserTicketReferralList = async (req, res, next) => {
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

    const piggyBox = await Piggybox.findOne({ where: { UserId: userId } });

    const userTicketCard = await UserTicketCard.findOne({
      where: { UserId: userId, TicketCardId: ticketCard.id },
    });
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
    });

    // Step 4: Classify referred users into three categories
    const referredUsersInfo = [];

    // Step 5: Iterate over each ReferredUser to get the associated User information
    for (const referredUser of referredUsers) {
      // // Fetch the Referral associated with the current ReferredUser
      // const referral = await Referrals.findOne({
      //   where: { id: referredUser.ReferralId },
      // });

      // if (!referral) continue;

      // Fetch the associated User for each referral
      const referredUserInfo = await User.findOne({
        where: { candidateId: referredUser.candidateId },
      });

      if (!referredUserInfo) continue;

      // Fetch the UserTicketCard for each referred user
      const userTicketCard = await UserTicketCard.findOne({
        where: { UserId: referredUserInfo.id, TicketCardId: ticketCard.id },
      });

      referredUsersInfo.push({
        candidateId: referredUserInfo.candidateId,
        name: referredUserInfo.name,
        userTicketCard: userTicketCard,
      });
    }

    // Step 6: Respond with the categorized lists
    res.status(200).json({
      success: true,
      userTicketCard,
      ticketCard,
      piggyBalance: piggyBox.piggyBalance,
      usersLists: referredUsersInfo,
    });
  } catch (error) {
    console.error("Error fetching user ticket referral list:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user ticket referral list",
    });

    console.log(error);
  }
};

exports.activateTicketCard = async (req, res, next) => {
  const { ticketTitle } = req.body;
  const userId = req.user.id;
  const user = req.user;
  let transaction;
  try {
    if (!ticketTitle) {
      return res
        .status(404)
        .json({ error: "Ticket Card information not found!" });
    }

    const ticketCard = await TicketCard.findOne({
      where: { title: ticketTitle },
    });
    if (!ticketCard) {
      return res.status(404).json({ message: "Ticket card not found." });
    }

    let userTicketCard = await UserTicketCard.findOne({
      where: { UserId: userId, TicketCardId: ticketCard.id },
    });

    if (userTicketCard && userTicketCard.isTicketActive) {
      return res.status(400).json({ message: "Ticket is already active." });
    }

    //console.log(userCurrentTicketCard);
    const piggybox = await Piggybox.findOne({ where: { UserId: userId } });
    if (!piggybox || piggybox.piggyBalance < ticketCard.price) {
      return res.status(400).json({ message: "Insufficient funds in wallet." });
    }

    transaction = await sequelize.transaction();

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

    const gstPercentage=(1+GST_PERCENTAGE/100)
    const actualAmount=ticketCard.price/(gstPercentage)
    const gstAmount=ticketCard.price-actualAmount;

    await PurchaseHistory.create({
      UserId:userId,
      type:ticketCard.title,
      description:"Purchased!",
      amount:ticketCard.price,
      gstAmount:gstAmount
    },{transaction})

    const userCurrentTicketCard = await userTicketCard.update(
      {
        isFundedFirst: true,
        rechargeCount: userTicketCard.rechargeCount + 1,
        isTicketActive: true,
      },
      { transaction }
    );

    const newPiggyBalance =
      parseFloat(piggybox.piggyBalance) - parseFloat(ticketCard.price);

    await piggybox.update({ piggyBalance: newPiggyBalance }, { transaction });

    const thistory = await TransactionHistory.create(
      {
        UserId: userId,
        transactionType: "purchase",
        remark: `Ticket purchased - ${ticketTitle}`,
        credit: 0,
        debit: ticketCard.price,
        balance: newPiggyBalance,
        merchantTransactionId: null,
        merchantUserId: null,
        createAt: new Date(Date.now() + 500),
      },
      { transaction }
    );

    await updateTopUserInfo(
      user.byReferallId,
      ticketTitle,
      transaction,
      userCurrentTicketCard
    );
    //console.log("FDFFFFFFFFFFFFFFFFFFFFFFFFF")
    //console.log(userCurrentTicketCard);
    //console.log("BELOW INFORMATION STUCK");
    await updateBelowUserInfo(
      user,
      ticketTitle,
      transaction,
      userCurrentTicketCard,
      piggybox
    );
    //console.log("LLLL");
    //console.log("-------------------------")
    //console.log(userCurrentTicketCard);
    await transaction.commit();

    sendDebitMessage(
      user.phone,
      ticketCard.price.toFixed(2),
      user.candidateId,
      `REF-25${thistory.id}`,
      newPiggyBalance.toFixed(2)
    );

    res.status(200).json({
      message: `${ticketTitle} activated successfully.`,
      piggyBalance: newPiggyBalance.toFixed(2),
    });
  } catch (error) {
    if (transaction) await transaction.rollback();

    console.log(error);
  }
};

//---------------------------
async function updateTopUserInfo(
  byReferallId,
  ticketTitle,
  transaction,
  userCurrentTicketCard
) {
  if (!byReferallId) {
    return;
  }

  try {
    const referralInfo = await Referrals.findOne({
      where: { referralId: byReferallId },
    });

    // Step 1: Find the user by referral ID
    const user = await User.findOne({ where: { id: referralInfo.UserId } });
    if (!user) return;

    // Step 2: Get the ticket card information by title
    const ticketCard = await TicketCard.findOne({
      where: { title: ticketTitle },
    });
    if (!ticketCard) return;

    // Step 3: Find or create UserTicketCard for this user and the specified TicketCard
    let userTicketCard = await UserTicketCard.findOne({
      where: { UserId: user.id, TicketCardId: ticketCard.id },
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

    if (!userReferrals) return;

    // Step 6: Find associated ReferredUsers for this referral
    const referredUsers = await ReferredUser.findAll({
      where: { ReferralId: userReferrals.id },
    });

    // Step 7: Get associated users via the Referral's UserId
    const activeReferredUsers = [];
    for (const referredUser of referredUsers) {
      // const referral = await Referrals.findOne({
      //   where: { id: referredUser.ReferralId },
      // });

      // if (!referral) continue;

      const referredUserInfo = await User.findOne({
        where: { candidateId: referredUser.candidateId },
      });

      if (!referredUserInfo) continue;

      let referredUserTicketCard;

      if (referredUserInfo.id === userCurrentTicketCard.UserId) {
        referredUserTicketCard = userCurrentTicketCard;
      } else {
        referredUserTicketCard = await UserTicketCard.findOne({
          where: {
            UserId: referredUserInfo.id,
            TicketCardId: ticketCard.id,
          },
        });
      }

      if (referredUserTicketCard &&
        referredUserTicketCard.completedCount <
        referredUserTicketCard.rechargeCount
      ) {
        activeReferredUsers.push(referredUserTicketCard);
      }
    }

    // Step 8: Check if active referred users meet the threshold
    const activeReferredUserCount = activeReferredUsers.length;

    if (activeReferredUserCount >= SUBH_DHAN_LABH_USER_COUNT) {
      // Step 9: Update user piggyBox balance with calculated bonus
      const bonusAmount =
        SUBH_DHAN_LABH_USER_COUNT *
        ticketCard.price *
        (SUBH_DHAN_LABH_PERCENTAGE_DISTRIBUTION / 100);

      const piggyBox = await Piggybox.findOne({
        where: { UserId: user.id },
        //  transaction,
      });

      const newPiggyBoxBalance =
        parseFloat(piggyBox.piggyBalance) + bonusAmount;
      await piggyBox.update(
        { piggyBalance: newPiggyBoxBalance },
        { transaction }
      );

      // Set user's isTicketActive to false
      await userTicketCard.update(
        {
          isTicketActive: false,
          affiliateBonus:
            parseFloat(userTicketCard.affiliateBonus) + bonusAmount,
        },
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
          createdAt: new Date(Date.now() + 1000),
        },
        { transaction }
      );

      // Step 11: Update oldest active referred users to isCompleted = true
      const oldestReferredUsers = activeReferredUsers.slice(
        0,
        SUBH_DHAN_LABH_USER_COUNT
      );

      for (const referredUserTicket of oldestReferredUsers) {
        await referredUserTicket.update(
          { completedCount: referredUserTicket.completedCount + 1 },
          { transaction }
        );
      }

      sendCreditMessage(
        user.phone,
        bonusAmount.toFixed(2),
        user.candidateId,
        `REF-35${thistory.id}`,
        piggyBox.piggyBalance.toFixed(2)
      );
    }

    // Continue with the remaining logic as in your original function...
  } catch (error) {
    console.error("Error updating top user information:", error);
    throw error;
  }
}

async function updateBelowUserInfo(
  user,
  ticketTitle,
  transaction,
  currentUserTicketCard,
  currentUserPiggyBox
) {
  try {
    const ticketCard = await TicketCard.findOne({
      where: { title: ticketTitle },
    });
    if (!ticketCard) return;

    const userReferrals = await Referrals.findOne({
      where: { UserId: user.id },
    });
    if (!userReferrals) return;

    const referredUsers = await ReferredUser.findAll({
      where: { ReferralId: userReferrals.id },
    });

    const activeReferredUsers = [];
    for (const referredUser of referredUsers) {
      const referredUserInfo = await User.findOne({
        where: { candidateId: referredUser.candidateId },
      });

      if (!referredUserInfo) continue;

      const referredUserTicketCard = await UserTicketCard.findOne({
        where: {
          UserId: referredUserInfo.id,
          TicketCardId: ticketCard.id,
        },
      });

      if (
        referredUserTicketCard &&
        referredUserTicketCard.completedCount <
          referredUserTicketCard.rechargeCount
      ) {
        activeReferredUsers.push(referredUserTicketCard);
      }
    }

    // Step 4: Check if active referred users meet the threshold
    const activeReferredUserCount = activeReferredUsers.length;
    if (activeReferredUserCount >= SUBH_DHAN_LABH_USER_COUNT) {
      // Step 6: Update user piggyBox balance with calculated bonus
      const bonusAmount =
        SUBH_DHAN_LABH_USER_COUNT *
        ticketCard.price *
        (SUBH_DHAN_LABH_PERCENTAGE_DISTRIBUTION / 100);

      const piggyBox = currentUserPiggyBox;

      const newPiggyBoxBalance =
        parseFloat(piggyBox.piggyBalance) + bonusAmount;

      await piggyBox.update(
        { piggyBalance: newPiggyBoxBalance },
        { transaction }
      );

      await currentUserTicketCard.update(
        {
          isTicketActive: false,
          affiliateBonus:
            parseFloat(currentUserTicketCard.affiliateBonus) + bonusAmount,
        },
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
          createdAt: new Date(Date.now() + 1500),
        },
        { transaction }
      );

      // Step 8: Update oldest active referred users to isCompleted = true
      const oldestReferredUsers = activeReferredUsers.slice(
        0,
        SUBH_DHAN_LABH_USER_COUNT
      );

      for (const referredUserTicket of oldestReferredUsers) {
        await referredUserTicket.update(
          { completedCount: referredUserTicket.completedCount + 1 },
          { transaction }
        );
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

    // Continue with the remaining logic as in your original function...
  } catch (error) {
    console.error("Error updating below user information:", error);
    throw error;
  }
}
