const fs = require("fs");
const path = require("path");
const UserKyc = require("../../../Models/Kyc/userKyc");
const { Op } = require("sequelize");
const { sendKycSuccessfullMessage } = require("../../../Utils/MailService");
const BankDetails = require("../../../Models/PiggyBox/bankDetails");
const sequelize = require("../../../database");
const { error } = require("console");

exports.postFormSubmit = async (req, res, next) => {
  let transaction;
  try {
    const user = req.user;

    // Fetch existing KYC entry for the user
    const userKyc = await user.getUserKyc();

    if (userKyc) {
      if (userKyc.status === "Pending") {
        return res.status(402).json({ error: "Your KYC is under review!" });
      } else if (userKyc.status === "Verified") {
        return res.status(402).json({ error: "KYC is already verified!" });
      }
    }

    // Extract and validate files
    const userImage = req.files?.userImage?.[0] || null;
    const aadharFront = req.files?.aadharFront?.[0] || null;
    const aadharBack = req.files?.aadharBack?.[0] || null;

    if (!aadharFront || !aadharBack || !userImage) {
      return res
        .status(400)
        .json({ error: "All required files must be uploaded." });
    }

    const candidateId = user.candidateId;
    const baseDir = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "CustomerFiles",
      candidateId
    );
    const adharDir = path.join(baseDir, "Adhar");
    const userDir = path.join(baseDir, "User");
    const adharDirUrl = `/files/${candidateId}/Adhar/`;
    const userDirUrl = `/files/${candidateId}/User/`;

    // Delete existing adhar folder and recreate it
    if (fs.existsSync(adharDir)) {
      fs.rmSync(adharDir, { recursive: true, force: true });
    }
    // Delete existing user folder and recreate it
    if (fs.existsSync(userDir)) {
      fs.rmSync(userDir, { recursive: true, force: true });
    }

    fs.mkdirSync(baseDir, { recursive: true });
    fs.mkdirSync(adharDir);
    fs.mkdirSync(userDir);

    // Helper function to save files
    const saveFile = (file, dir, name) => {
      if (file) {
        const ext = path.extname(file.originalname);
        const filePath = path.join(dir, `${name}${ext}`);
        fs.writeFileSync(filePath, file.buffer);
        return name + ext;
      }
      return null;
    };

    // Save new files
    const aadharFrontUrl =
      adharDirUrl + saveFile(aadharFront, adharDir, `${candidateId}_front`);
    const aadharBackUrl =
      adharDirUrl + saveFile(aadharBack, adharDir, `${candidateId}_back`);
    const userUrl =
      userDirUrl + saveFile(userImage, userDir, `${candidateId}_user`);

    const obj = {
      ...req.body,
      aadharFrontUrl,
      aadharBackUrl,
      userUrl,
      status: "Pending",
    };

    // Check for duplicate Aadhaar or PAN numbers
    const duplicateKyc = await UserKyc.findOne({
      where: {
        [Op.or]: [{ aadharNumber: req.body.aadharNumber }],
        id: { [Op.ne]: userKyc?.id || null },
      },
    });

    if (duplicateKyc) {
      return res
        .status(400)
        .json({ error: "Aadhaar number already exists for another user." });
    }

    transaction = await sequelize.transaction();

    // Update user and bank details
    await user.update(
      { email: req.body.email, name: req.body.name },
      { transaction }
    );

    const existingBankDetails = await BankDetails.findOne({
      where: { UserId: user.id },
    });
    if (existingBankDetails) {
      await existingBankDetails.update(
        { accountHolderName: req.body.name },
        { transaction }
      );
    }

    // Create or update KYC details
    if (!userKyc) {
      await user.createUserKyc(
        { ...obj, kycVerificationCount: 1 },
        { transaction }
      );
    } else {
      await userKyc.update(
        { ...obj, kycVerificationCount: userKyc.kycVerificationCount + 1 },
        { transaction }
      );
    }

    await transaction.commit();

    res.status(201).json({ message: "Files and data saved successfully." });
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};

exports.getUserAgreementInfo = async (req, res, next) => {
  try {
    // Fetch the associated UserKyc data for the logged-in user
    const userKyc = await UserKyc.findOne({ where: { UserId: req.user.id } });

    // Check if userKyc is null
    if (!userKyc) {
      return res.status(200).json({
        userAgreement: false,
        userKyc: false,
        status: userKyc.status,
        message: "No KYC data available for the user.",
      });
    }

    // Check if userAggreementAccepted is true or false
    const isUserAgreementAccepted = userKyc.userAggreementAccepted;

    // Respond with the result
    return res.status(200).json({
      userAgreement: isUserAgreementAccepted,
      userKyc: true,
      status: userKyc.status,
      message: isUserAgreementAccepted
        ? "User agreement accepted."
        : "User agreement not accepted.",
    });
  } catch (error) {
    console.error("Error fetching user agreement info:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

exports.acceptUserAgreement = async (req, res, next) => {
  try {
    // Fetch the associated UserKyc data for the logged-in user
    const userKyc = await UserKyc.findOne({ where: { UserId: req.user.id } });

    // Check if userKyc is null
    if (!userKyc) {
      return res.status(404).json({
        message: "No KYC data found for the user.",
      });
    }

    // Get current date and time in the format DD/MM/YYYY HH:MM:SS
    const currentDateTime = new Date();
    const formattedDateTime = `${currentDateTime
      .getDate()
      .toString()
      .padStart(2, "0")}/${(currentDateTime.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${currentDateTime.getFullYear()} ${currentDateTime
      .getHours()
      .toString()
      .padStart(2, "0")}:${currentDateTime
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${currentDateTime
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;

    // Update the user agreement status and time
    userKyc.userAggreementAccepted = true;
    userKyc.timeOfUserAggreementAccept = formattedDateTime;
    await userKyc.save();

    await sendKycSuccessfullMessage(req.user.phone);

    // Respond with a success message
    return res.status(200).json({
      message: "User agreement accepted successfully.",
      userAgreement: true,
      timeOfUserAgreementAccept: formattedDateTime,
    });
  } catch (error) {
    console.error("Error accepting user agreement:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

exports.updatePanDetails = async (req, res, next) => {
  let transaction;
  try {
    const user = req.user;

    // Fetch existing PAN entry for the user
    const userKyc = await user.getUserKyc();

    if (!userKyc) {
      return res.status(404).json({ error: "User must be KYC verified!" });
    }

    if (userKyc) {
      if (userKyc.status !== "Verified") {
        return res.status(404).json({ error: "User must be KYC verified!" });
      }
      if (userKyc.panStatus === "Pending") {
        return res.status(402).json({ error: "Your PAN is under review!" });
      } else if (userKyc.panStatus === "Verified") {
        return res.status(402).json({ error: "PAN is already verified!" });
      }
    }

    // Extract and validate files
    const panFile = req.files["panFile"] ? req.files["panFile"][0] : null;

    if (!panFile) {
      return res.status(400).json({ error: "Upload PAN Image first!" });
    }

    const candidateId = user.candidateId;
    const baseDir = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "CustomerFiles",
      candidateId
    );
    const panDir = path.join(baseDir, "Pan");

    const panDirUrl = `/files/${candidateId}/Pan/`;

    // Delete existing adhar folder and recreate it
    if (fs.existsSync(panDir)) {
      fs.rmSync(panDir, { recursive: true, force: true });
    }

    fs.mkdirSync(baseDir, { recursive: true });
    fs.mkdirSync(panDir);

    // Helper function to save files
    const saveFile = (file, dir, name) => {
      if (file) {
        const ext = path.extname(file.originalname);
        const filePath = path.join(dir, `${name}${ext}`);
        fs.writeFileSync(filePath, file.buffer);
        return name + ext;
      }
      return null;
    };

    const panUrl = panDirUrl + saveFile(panFile, panDir, `${candidateId}_pan`);

    const obj = { panNumber: req.body.panNumber, panUrl, panStatus: "Pending" };

    // Check for duplicate Aadhaar or PAN numbers
    const duplicateKyc = await UserKyc.findOne({
      where: {
        [Op.or]: [{ panNumber: req.body.panNumber }],
        id: { [Op.ne]: userKyc?.id || null },
      },
    });

    if (duplicateKyc) {
      return res
        .status(400)
        .json({ error: "PAN number already exists for another user." });
    }

    transaction = await sequelize.transaction();

    // Create or update KYC details
    if (!userKyc) {
      await user.createUserKyc(
        { ...obj, panVerificationCount: 1 },
        { transaction }
      );
    } else {
      await userKyc.update(
        { ...obj, panVerificationCount: userKyc.panVerificationCount + 1 },
        { transaction }
      );
    }

    await transaction.commit();

    res.status(201).json({ message: "Files and data saved successfully." });
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};

exports.getUserKycAndPanInfo = async (req, res, next) => {
  try {
    const user = req.user;

    // Fetch existing PAN entry for the user
    const userKyc = await user.getUserKyc();

    if (!userKyc) {
      return res.status(404).json({ error: "User must be KYC verified!" });
    }

    return res.json({
      kycAndPanDetails: userKyc,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};
