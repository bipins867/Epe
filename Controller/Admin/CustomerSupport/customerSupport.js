const CaseMessage = require("../../../Models/CustomerSupport/caseMessage");
const CaseUser = require("../../../Models/CustomerSupport/caseUser");
const CustomerCase = require("../../../Models/CustomerSupport/customerCase");
const Admin = require("../../../Models/User/admins");

const { Op } = require("sequelize");
const { sendMessage2User } = require("../../../Server-Socket/server");
const CaseAndAdmin = require("../../../Models/CustomerSupport/caseAndAdmin");

exports.getDashboardInfo = async (req, res, next) => {
  try {
    const adminType = req.admin.adminType; // Get the admin type
    const adminId = req.admin.userName;
    // 1. Get count of open cases directly
    const openCasesCount = await CustomerCase.count({
      where: { status: "Open" },
    });

    // 2. Initialize counts for pending, closed, and transferred cases
    let pendingCasesCount = 0;
    let closedCasesCount = 0;
    let transferredCasesCount = 0;
    let pendingCasesWithUnSeenMessages = 0;

    // 3. Count pending cases
    if (adminType === "SSA" || adminType === "SA") {
      // For SSA and SA, include all pending cases
      pendingCasesCount = await CustomerCase.count({
        where: { status: "Pending" },
      });

      // Count unseen messages in all pending cases
      const pendingCases = await CustomerCase.findAll({
        where: { status: "Pending" },
        include: [
          {
            model: CaseMessage,
            where: { isAdminSend: false },
            required: false,
          },
        ],
      });

      pendingCasesWithUnSeenMessages = pendingCases.reduce(
        (acc, customerCase) => {
          const caseMessages = customerCase.CaseMessages;
          const latestMessage = caseMessages.length ? caseMessages[0] : null;

          if (latestMessage && !latestMessage.seenByAdmin) {
            return acc + 1;
          }
          return acc;
        },
        0
      );
    } else if (adminType === "A") {
      // For admin type A, check associated adminId
      pendingCasesCount = await CustomerCase.count({
        where: {
          status: "Pending",
          adminId: adminId,
        },
      });

      // Count unseen messages in pending cases associated with the admin
      const pendingCases = await CustomerCase.findAll({
        where: {
          status: "Pending",
          adminId: adminId,
        },
        include: [
          {
            model: CaseMessage,
            where: { isAdminSend: false },
            required: false,
          },
        ],
      });

      pendingCasesWithUnSeenMessages = pendingCases.reduce(
        (acc, customerCase) => {
          const caseMessages = customerCase.CaseMessages;
          const latestMessage = caseMessages.length ? caseMessages[0] : null;

          if (latestMessage && !latestMessage.seenByAdmin) {
            return acc + 1;
          }
          return acc;
        },
        0
      );
    }

    // 4. Count closed cases based on associated admin
    if (adminType === "SSA" || adminType === "SA") {
      // For SSA and SA, include all closed cases
      closedCasesCount = await CustomerCase.count({
        where: { status: "Closed" },
      });
    } else if (adminType === "A") {
      // For admin type A, check associated adminId
      closedCasesCount = await CustomerCase.count({
        where: {
          status: "Closed",
          adminId: adminId,
        },
      });
    }

    // 5. Count transferred cases directly
    transferredCasesCount = await CustomerCase.count({
      where: { status: "Transferred" },
    });

    // 6. Construct and return the response
    res.status(200).json({
      numberOfOpenCases: openCasesCount || 0,
      numberOfPendingCases: pendingCasesCount || 0,
      numberOfClosedCases: closedCasesCount || 0,
      numberOfTransferredCases: transferredCasesCount || 0,
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
    const adminType = req.admin.adminType; // Get the admin type
    const adminId = req.admin.userName; // Get the associated admin ID

    // Define the condition based on adminType
    let whereCondition = {
      [Op.or]: [{ isClosedByUser: true }, { isClosedByAdmin: true }],
    };

    // If the adminType is SSA or SA, fetch all closed cases
    if (adminType !== "SSA" && adminType !== "SA") {
      // If not SSA or SA, add condition to check for associated adminId
      whereCondition = {
        ...whereCondition,
        adminId: adminId, // Only include cases associated with this admin
      };
    }

    // Fetch closed cases based on the defined condition
    const closedCases = await CustomerCase.findAll({
      where: whereCondition,
      order: [["closeTime", "DESC"]], // Order by close time
      include: [
        {
          model: CaseUser, // Include CaseUser details
          attributes: ["id", "name", "email", "isExistingUser"], // Specify the attributes you want to return for the user
        },
      ],
    });

    // Return the list of closed cases
    res.status(200).json(closedCases);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong while fetching closed cases.",
    });
  }
};


exports.getPendingCases = async (req, res, next) => {
  try {
    const adminType = req.admin.adminType; // Get the admin type
    const adminId = req.admin.userName; // Get the associated admin ID

    // Define where condition based on adminType
    let whereCondition = {
      status: "Pending",
    };

    // If the adminType is not SSA or SA, restrict to cases assigned to the admin
    if (adminType !== "SSA" && adminType !== "SA") {
      whereCondition.adminId = adminId; // Only fetch cases assigned to the current admin
    }

    // Fetch all pending cases based on the defined condition
    const pendingCases = await CustomerCase.findAll({
      where: whereCondition,
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
    res.status(200).json({result,pendingCases});
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong while fetching pending cases.",
    });
  }
};


exports.getTransferedCases = async (req, res, next) => {
  try {
    // Fetch all cases with status 'Transfered' and associated user information
    const transferedCases = await CustomerCase.findAll({
      where: { status: "Transferred" },
      order: [["creationTime", "DESC"]],
      include: [
        {
          model: CaseUser, // Include CaseUser details
          attributes: ["id", "name", "email", "isExistingUser"], // Specify the attributes you want to return for the user
        },
      ],
    });

    // Optionally format the response if you want to control the output structure
    console.log(transferedCases)
    // Return the list of Transfered cases with associated user info
    res.status(200).json(transferedCases);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching Transfered cases." });
  }
};

exports.getCaseInfo = async (req, res, next) => {
  try {
    const { caseId } = req.params; // Assuming caseId is provided as a route parameter
    const adminId = req.admin.userName; // Get the associated admin ID
    const adminType = req.admin.adminType; // Get the admin type

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

    // 3. Verify access based on admin type
    if (adminType !== "SSA" && adminType !== "SA" && caseInfo.status!=='Open' && caseInfo.status!=='Transferred') {
      // If the admin is not SSA or SA, check if they are associated with the case
      if (caseInfo.adminId !== adminId) {
        return res.status(403).json({ message: "Access denied: You are not authorized to view this case." });
      }
    }

    // 4. Return the case information along with associated user
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
    const { caseId } = req.params;
    const adminId = req.admin.userName; // Get the associated admin ID
    const adminType = req.admin.adminType; // Get the admin type
    
    // Assuming caseId is provided as a route parameter
    const customerCase = await CustomerCase.findOne({
      where: { caseId: caseId },
    });

     // 3. Verify access based on admin type
     if (adminType !== "SSA" && adminType !== "SA" && customerCase.status!=='Open' && customerCase.status!=='Transferred') {
      // If the admin is not SSA or SA, check if they are associated with the case
      if (customerCase.adminId !== adminId) {
        return res.status(403).json({ message: "Access denied: You are not authorized to view this case." });
      }
    }



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
    res.status(200).json({ messages: messages.reverse() });
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
    const adminId = req.admin.userName; // Assuming adminId is available in req.admin

    // Check if caseId is provided
    if (!caseId) {
      return res.status(400).json({ error: "caseId is required." });
    }

    // Find the case by caseId
    const customerCase = await CustomerCase.findOne({
      where: { caseId: caseId },
    });

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

    // Add a message indicating the case was closed by the admin
    const newMessage=await CaseMessage.create({
      message: `Case ${caseId} has been closed by Admin ID: ${adminId}.`,
      messageType: 'info-close', // Message type is 'info' to indicate system event
      isAdminSend: true, // Indicates the message was sent by an admin
      AdminId: adminId, // Associate the message with the admin
      CustomerCaseId: customerCase.id, // Associate the message with the case
      creationTime: new Date(),
      isFile: false
    });
    sendMessage2User(caseId, newMessage);
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
      isAdminSend: true,
      adminId: req.admin.userName, // Indicates that the message is from the admin
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
    sendMessage2User(caseId, newMessage);

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

exports.addAdminToCase = async (req, res, next) => {
  try {
    const { caseId } = req.body; // Case ID from request body
    const adminId = req.admin.userName; // Extracting adminId (userName) from req.admin

    // Validate that both caseId and adminId are provided
    if (!caseId || !adminId) {
      return res.status(400).json({
        message: "Case ID and Admin ID are required.",
      });
    }

    // Find the case by caseId
    const customerCase = await CustomerCase.findOne({
      where: { caseId: caseId },
    });

    // Check if the case exists
    if (!customerCase) {
      return res.status(404).json({
        message: "Case not found.",
      });
    }
    
    // Check if an admin is already assigned to the case
    if (customerCase.adminId !== null ) {
      return res.status(400).json({
        message: "An admin is already assigned to this case.",
      });
    }

    // Check the status of the case
    if (customerCase.status === "Pending" || customerCase.status === "Closed") {
      return res.status(400).json({
        message: `Admin cannot be assigned to a ${customerCase.status} case.`,
      });
    }

    // Find the admin by adminId (userName)
    const admin = await Admin.findOne({
      where: { userName: adminId },
    });

    // Check if the admin exists
    if (!admin) {
      return res.status(404).json({
        message: "Admin not found.",
      });
    }

    // If the case is "Open" or "Transferred", proceed with assigning the admin
    if (customerCase.status === "Open" || customerCase.status === "Transferred") {
      // Update the customer case with the adminId
      customerCase.adminId = admin.userName;
      customerCase.status='Pending';
      await customerCase.save();

      // Create an association in the CaseAndAdmin table
      await CaseAndAdmin.create({
        customerCaseId: customerCase.caseId,
        adminId: admin.userName,
      });

      // Add a case message indicating the admin has been assigned
      const newMessage=await CaseMessage.create({
        message: `Admin ${admin.userName} has been assigned to the case.`,
        adminId: admin.userName,
        isAdminSend: true,
        creationTime: new Date(),
        messageType: "info",
        CustomerCaseId: customerCase.id, // Associating the message with the case
      });
      sendMessage2User(caseId, newMessage);
      // Return success response
      return res.status(200).json({
        message: "Admin assigned to case successfully.",
        customerCase,
      });
    }
  } catch (error) {
    console.error("Error assigning admin to case:", error);
    res.status(500).json({
      message: "An error occurred while assigning admin to case.",
      error,
    });
  }
};

exports.transferCase = async (req, res, next) => {
  try {
    const { caseId } = req.body; // The case ID to be transferred
    const adminId = req.admin.userName; // Extracting adminId (userName) from req.admin
    const adminType = req.admin.adminType; // Extracting adminType from req.admin

    // Find the case by caseId
    const customerCase = await CustomerCase.findOne({
      where: { caseId },
    });

    if (!customerCase) {
      return res.status(404).json({ error: "Case not found." });
    }
    if(customerCase.status==='Closed'){
      return res.status(403).json({error:"You are not authorized to  transfer the closed cases!"})
    }
    // Check if the adminType is 'SA' or 'SSA'
    if (adminType === 'SA' || adminType === 'SSA') {
      // Allow transfer without further checks
      customerCase.adminId = null; // Set adminId to null
      customerCase.status = "Transferred"; // Set status to 'Transferred'
    } else if (adminType === 'A') {
      // If adminType is 'A', check if the admin is associated with the case
      if (customerCase.adminId !== adminId) {
        return res.status(403).json({
          error: "You are not authorized to transfer this case. Admin is not associated with this case.",
        });
      }

      // Proceed to transfer if admin is associated
      customerCase.adminId = null; // Set adminId to null
      customerCase.status = "Transferred"; // Set status to 'Transferred'
    } else {
      return res.status(403).json({
        error: "Invalid admin type.",
      });
    }

    // Save the changes to the database
    await customerCase.save();

    res.status(200).json({ message: "Case successfully transferred." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Something went wrong while transferring the case." });
  }
};
