const jwt = require("jsonwebtoken");
const CaseUser = require("../../Models/CustomerSupport/caseUser");
const CustomerCase = require("../../Models/CustomerSupport/customerCase");
const fs = require("fs");
const path = require("path");

const CaseMessage = require("../../Models/CustomerSupport/caseMessage");
const { sendMessage2Admin } = require("../../Server-Socket/server");

// Helper function to generate a random string with 4 alphabets and 4 numbers
function generateRandomCaseNumber() {
  const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  // Generate 4 random alphabets
  let randomAlphabets = "";
  for (let i = 0; i < 4; i++) {
    randomAlphabets += alphabets.charAt(
      Math.floor(Math.random() * alphabets.length)
    );
  }

  // Generate 4 random numbers
  let randomNumbers = "";
  for (let i = 0; i < 4; i++) {
    randomNumbers += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  // Concatenate the alphabets and numbers
  return randomAlphabets + randomNumbers;
}

exports.createUserAndCase = async (req, res, next) => {
  try {
    const { name, email, isExistingUser, candidateId } = req.body;

    // Save user to the database
    const user = await CaseUser.create({
      name,
      email,
      candidateId: isExistingUser ? candidateId : null,
      isExistingUser,
    });

    // Generate a random case number using custom function
    const caseNumber = generateRandomCaseNumber();

    // Create a new case associated with the user
    const customerCase = await user.createCustomerCase({
      caseId: caseNumber,
      creationTime: new Date(),
      status: "Open", // Default status
    });

    // Prepare data for JWT payload
    const tokenPayload = {
      name: user.name,
      email: user.email,
      isExistingUser,
      candidateId: user.candidateId,
      caseNumber: customerCase.caseId,
    };

    // Sign JWT token
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET_KEY, {
      expiresIn: "1w",
    });

    // Return the token to the user
    res.status(201).json({
      message: "User and case created successfully.",
      chatToken: token,
      caseId: customerCase.caseId,
    });
  } catch (error) {
    console.error("Error creating user and case:", error);
    res.status(500).json({
      message: "An error occurred while creating the user and case.",
      error,
    });
  }
};

exports.closeCaseByUser = async (req, res, next) => {
  try {
    const { caseId } = req.body; // Assuming caseId and userId are provided in the request body

    // Check if caseId and userId are provided
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

    // Check if the case is associated with the user (optional, if needed for authorization)
    // const isUserAuthorized = await CaseUser.findOne({ where: { caseId, userId } });
    // if (!isUserAuthorized) {
    //   return res.status(403).json({ error: "User is not authorized to close this case." });
    // }

    // Check if the case is currently open or pending
    if (customerCase.status !== "Open" && customerCase.status !== "Pending") {
      return res.status(400).json({
        error: "Case cannot be closed. It is not in an open or pending state.",
      });
    }

    // Update the case status to 'Closed' and mark it as closed by user
    await customerCase.update({
      status: "Closed",
      isClosedByUser: true,
      closeTime: new Date(), // Set the close time to the current date and time
    });

    // Return success response
    res.status(200).json({
      message: "Case closed successfully by the user.",
      data: customerCase,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong while closing the case.",
    });
  }
};

exports.getCaseInfo = async (req, res, next) => {
  try {
    const { caseId } = req.body; // Assuming caseId is provided as a route parameter

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
    const { caseId } = req.body; // Assuming caseId is provided as a route parameter
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
        .status(201)
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

exports.addUserMessage = async (req, res, next) => {
  try {
    // Extract case user and case from the request object
    const { caseUser, customerCase } = req;
    const { message, isFile = false } = req.body;

    // Verify that required information is present
    if (!caseUser || !customerCase) {
      return res
        .status(400)
        .json({ message: "Invalid user or case information." });
    }

    if (!message) {
      return res
        .status(400)
        .json({ message: "Message content cannot be empty." });
    }

    // Check if the case is closed
    if (customerCase.status === "Closed") {
      return res
        .status(403) // Forbidden status code
        .json({
          message:
            "Cannot add message to a closed case. - Please refress the page!",
        });
    }

    // 1. Create the new message associated with the customer case
    const newMessage = await customerCase.createCaseMessage({
      message,
      isFile,
      isAdminSend: false, // Indicates user-sent message
      creationTime: new Date(),
      seenByAdmin: false, // Default to unseen by admin
      seenByUser: true, // User sees their own message
    });

    // 2. Mark all previous admin messages as seen by the user
    await CaseMessage.update(
      { seenByUser: true }, // Update to set seenByUser to true
      {
        where: {
          CustomerCaseId: customerCase.id,
          isAdminSend: true, // Only admin messages
          seenByUser: false, // Only messages not yet seen by the user
        },
      }
    );

    // Notify admin of the new message
    sendMessage2Admin(customerCase.caseId, newMessage.message);

    // 3. Return the created message
    res.status(201).json({
      message:
        "Message created successfully, and admin messages marked as seen.",
      infoMessage: newMessage,
    });
  } catch (error) {
    console.error("Error creating user message:", error);
    res.status(500).json({
      message: "An error occurred while creating the message.",
      error,
    });
  }
};

exports.addUserFile = async (req, res, next) => {
  try {
    const { caseUser, customerCase } = req; // Extract case user and case from the request object
    const userFile = req.files["userFile"] ? req.files["userFile"][0] : null; // Assuming single file upload middleware
    const { caseId } = req.body; // Assuming caseId is provided in the request body

    // Verify that required information is present
    if (!caseUser || !customerCase || !userFile) {
      return res
        .status(400)
        .json({ message: "Invalid user, case information, or file." });
    }

    // Check if the case is closed
    if (customerCase.status === "Closed") {
      return res.status(403).json({
        message: "Cannot add file to a closed case. - Please refresh the page!",
      });
    }
    console.log(caseId);
    console.log(__dirname);
    // Ensure the base directory for storing files
    const baseDir = path.join(
      __dirname,
      "..",
      "..",

      "ChatSupport",
      caseId
    );
    console.log(baseDir);
    // Create directory if it doesn't exist
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    // Save the file in the specified directory
    const fileName = userFile.originalname; // Original name of the file
    const filePath = path.join(baseDir, fileName);

    // Save the file using fs
    fs.writeFileSync(filePath, userFile.buffer);

    // Define the relative path to be stored in the message
    const fileRelativePath = `${caseId}/${fileName}`;

    // 1. Create a new message entry for the file upload associated with the customer case
    const newFileMessage = await customerCase.createCaseMessage({
      message: fileRelativePath, // Store the relative file path
      isFile: true, // Indicates it is a file
      isAdminSend: false, // Indicates user-sent message
      creationTime: new Date(),
      seenByAdmin: false, // Default to unseen by admin
      seenByUser: true, // User sees their own message
    });

    // 2. Mark all previous admin messages as seen by the user
    await CaseMessage.update(
      { seenByUser: true }, // Update to set seenByUser to true
      {
        where: {
          CustomerCaseId: customerCase.id,
          isAdminSend: true, // Only admin messages
          seenByUser: false, // Only messages not yet seen by the user
        },
      }
    );

    // Notify admin of the new file
    sendMessage2Admin(customerCase.caseId, newFileMessage.message);

    // 3. Return the created message
    res.status(201).json({
      message: "File uploaded successfully, and admin messages marked as seen.",
      fileMessage: newFileMessage,
    });
  } catch (error) {
    console.error("Error uploading user file:", error);
    res.status(500).json({
      message: "An error occurred while uploading the file.",
      error,
    });
  }
};
