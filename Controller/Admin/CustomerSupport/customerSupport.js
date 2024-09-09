
const { sendMessage2User } = require("../../../app");
const CaseMessage = require("../../../Models/CustomerSupport/caseMessage");
const CaseUser = require("../../../Models/CustomerSupport/caseUser");
const CustomerCase = require("../../../Models/CustomerSupport/customerCase");

const { Op } = require("sequelize");



exports.getDashboardInfo = async (req, res, next) => {
  try {
    // 1. Get count of cases by status
    const [openCasesCount, pendingCasesCount, closedCasesCount] =
      await Promise.all([
        CustomerCase.count({ where: { status: "Open" } }), // Count of open cases
        CustomerCase.count({ where: { status: "Pending" } }), // Count of pending cases
        CustomerCase.count({ where: { status: "Closed" } }), // Count of closed cases
      ]);

    // 2. Get all pending cases
    const pendingCases = await CustomerCase.findAll({
      where: { status: "Pending" },
      include: [
        {
          model: CaseMessage,
          where: { isAdminSend: false }, // Filter messages where the admin did not send the message
          required: false, // Include cases even if there are no messages matching the criteria
          order: [["createdAt", "DESC"]], // Order by the most recent message
        },
      ],
    });

    // 3. Count cases where the last message is seen by admin
    const pendingCasesWithUnSeenMessages = pendingCases.reduce(
      (acc, customerCase) => {
        const caseMessages = customerCase.CaseMessages;
        const latestMessage = caseMessages.length ? caseMessages[0] : null; // Get the latest message, if any

        if (latestMessage && latestMessage.seenByAdmin === false) {
          return acc + 1; // Increment count if the latest message was seen by admin
        }
        return acc;
      },
      0
    );

    // 4. Construct and return the response
    res.status(200).json({
      numberOfOpenCases: openCasesCount || 0,
      numberOfPendingCases: pendingCasesCount || 0,
      numberOfClosedCases: closedCasesCount || 0,
      pendingCasesWithUnSeenMessages: pendingCasesWithUnSeenMessages || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong while fetching dashboard information.",
    });
  }
};
exports.getOpenCases = async (req, res, next) => {
  try {
    // Fetch all cases with status 'Open' and associated user information
    const openCases = await CustomerCase.findAll({
      where: { status: "Open" },
      order: [["creationTime", "DESC"]],
      include: [
        {
          model: CaseUser, // Include CaseUser details
          attributes: ["id", "name", "email", "isExistingUser"], // Specify the attributes you want to return for the user
        },
      ],
    });

    // Optionally format the response if you want to control the output structure

    // Return the list of open cases with associated user info
    res.status(200).json(openCases);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching open cases." });
  }
};

exports.getClosedCases = async (req, res, next) => {
  try {
    // Fetch all cases where the case is closed by either user or admin
    const closedCases = await CustomerCase.findAll({
      where: {
        [Op.or]: [{ isClosedByUser: true }, { isClosedByAdmin: true }],
      },
      order: [["closeTime", "DESC"]],
      include: [
        {
          model: CaseUser, // Include CaseUser details
          attributes: ["id", "name", "email", "isExistingUser"], // Specify the attributes you want to return for the user
        },
      ], // Optionally, you can order by close time or any other field
    });

    // Return the list of closed cases
    res.status(200).json(closedCases);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching closed cases." });
  }
};

exports.getPendingCases = async (req, res, next) => {
  try {
    // Fetch all cases where the status is 'Pending' and include associated user and latest message info
    const pendingCases = await CustomerCase.findAll({
      where: {
        status: "Pending",
      },
      include: [
        {
          model: CaseMessage,
          attributes: [
            "id",
            "message",
            "seenByAdmin",
            "createdAt",
            "isAdminSend",
          ],
          order: [["createdAt", "DESC"]], // To get the latest message first
          limit: 1, // Limit to the latest message
        },
        {
          model: CaseUser, // Include associated user information
          attributes: ["id", "name", "email", "isExistingUser"], // Specify user attributes to return
        },
      ],
    });

    // Prepare the response to include the 'seenByAdmin' condition of the last message for each case
    const result = pendingCases.map((caseData) => {
      const latestMessage = caseData.CaseMessages && caseData.CaseMessages[0]; // The latest message based on the query
      return {
        caseId: caseData.caseId,
        status: caseData.status,
        latestMessageSeenByAdmin: latestMessage
          ? latestMessage.seenByAdmin
          : null, // Return 'null' if no messages are associated
        latestMessage: latestMessage ? latestMessage.message : null, // The latest message content
        caseUser: caseData.CaseUser, // Associated user information
      };
    });

    // Return the list of pending cases with associated 'seenByAdmin' information
    res.status(200).json(pendingCases);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching pending cases." });
  }
};

exports.getCaseInfo = async (req, res, next) => {
  try {
    const { caseId } = req.params; // Assuming caseId is provided as a route parameter

    // 1. Find the case by ID and include the associated CaseUser
    const caseInfo = await CustomerCase.findOne({
      where: { caseId: caseId },
      include: [
        {
          model: CaseUser,
          required: true, // Ensures a case without a user won't be returned
        },
      ],
    });

    // 2. Check if case info was found
    if (!caseInfo) {
      return res.status(404).json({ message: "Case not found." });
    }

    // 3. Return the case information along with associated user
    res.status(200).json({
      caseInfo,
      // Accessing the associated user information
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong while fetching case information.",
    });
  }
};

exports.getCaseMessages = async (req, res, next) => {
  try {
    const { caseId } = req.params; // Assuming caseId is provided as a route parameter
    const customerCase = await CustomerCase.findOne({
      where: { caseId: caseId },
    });
    // Fetch the top 20 messages associated with the given caseId
    const messages = await CaseMessage.findAll({
      where: { CustomerCaseId: customerCase.id },
      order: [["createdAt", "DESC"]], // Order by creation time in descending order (latest first)
      limit: 20, // Limit the result to top 20 messages
    });

    // Check if messages were found
    if (!messages || messages.length === 0) {
      return res
        .status(404)
        .json({ message: "No messages found for the provided case ID." });
    }

    // Return the list of messages
    res.status(200).json({ messages:messages.reverse() });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong while fetching messages.",
    });
  }
};

exports.closeCaseByAdmin = async (req, res, next) => {
  try {
    const { caseId } = req.body; // Assuming caseId is provided in the request body

    // Check if caseId is provided
    if (!caseId) {
      return res.status(400).json({ error: "caseId is required." });
    }

    // Find the case by caseId
    const customerCase = await CustomerCase.findOne({ where: { caseId: caseId } });

    // If the case does not exist
    if (!customerCase) {
      return res.status(404).json({ error: "Case not found." });
    }

    // Update the case status to 'Closed' and mark it as closed by admin
    await customerCase.update({
      status: "Closed",
      isClosedByAdmin: true,
      closeTime: new Date(), // Set the close time to the current date and time
    });

    // Return success response
    res.status(200).json({
      message: "Case closed successfully by the admin.",
      data: customerCase,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong while closing the case.",
    });
  }
};

exports.addAdminMessage = async (req, res, next) => {
  try {
    const { caseId, message } = req.body; // Assuming caseId and message are provided in the request body

    // Check if caseId and message are provided
    if (!caseId || !message) {
      return res
        .status(400)
        .json({ error: "caseId and message are required." });
    }

    // Find the customer case by caseId
    const customerCase = await CustomerCase.findOne({
      where: { caseId: caseId },
    });

    if (!customerCase) {
      return res.status(404).json({ error: "Customer case not found." });
    }

    // Check if the case is closed
    if (customerCase.status === "Closed") {
      return res
        .status(403) // Forbidden status code
        .json({ error: "Cannot add a message to a closed case." });
    }

    // 1. Insert a new message from the admin into the associated case
    const newMessage = await customerCase.createCaseMessage({
      message: message,
      isFile: false,
      creationTime: new Date(),
      isAdminSend: true, // Indicates that the message is from the admin
      seenByAdmin: true,
      seenByUser: false, // Admin has seen their own message
    });

    // 2. Check if this is the first message sent by the admin
    const adminMessagesCount = await CaseMessage.count({
      where: {
        CustomerCaseId: customerCase.id,
        isAdminSend: true,
      },
    });

    // If this is the first admin message and case is open, update the status to "Pending"
    if (customerCase.status === "Open") {
      await customerCase.update({ status: "Pending" });
    }

    // 3. Mark all previous user messages as seen by the admin
    await CaseMessage.update(
      { seenByAdmin: true }, // Update to set seenByAdmin to true
      {
        where: {
          CustomerCaseId: customerCase.id,
          isAdminSend: false, // Only user messages
          seenByAdmin: false, // Only messages not yet seen by the admin
        },
      }
    );

    // Notify user of the new message
    sendMessage2User(caseId, newMessage.message);

    // 4. Return the created message as a response
    res.status(201).json({
      message:
        "Admin message added successfully, and user messages marked as seen.",
      data: newMessage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong while adding the admin message.",
    });
  }
};

