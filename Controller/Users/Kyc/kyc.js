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
      if (userKyc.status === "Review") {
        return res.status(402).json({ error: "Your KYC is under review!" });
      } else if (userKyc.status === "Verified") {
        return res.status(402).json({ error: "KYC is already verified!" });
      }
    }

    // Extract and validate files
    const userImage = req.files?.userImage?.[0] || null;
    const aadharFront = req.files?.aadharFront?.[0] || null;
    const aadharBack = req.files?.aadharBack?.[0] || null;

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

    // Ensure directories exist
    fs.mkdirSync(baseDir, { recursive: true });
    fs.mkdirSync(adharDir, { recursive: true });
    fs.mkdirSync(userDir, { recursive: true });

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

    // Manage old file deletion and saving new files
    let updates = {};
    if (userImage) {
      if (userKyc?.userUrl) {
        const oldUserPath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          userKyc.userUrl
        );
        if (fs.existsSync(oldUserPath)) {
          fs.unlinkSync(oldUserPath);
        }
      }
      updates.userUrl =
        userDirUrl + saveFile(userImage, userDir, `${candidateId}_user`);
    }

    if (aadharFront) {
      if (userKyc?.aadharFrontUrl) {
        const oldFrontPath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          userKyc.aadharFrontUrl
        );
        if (fs.existsSync(oldFrontPath)) {
          fs.unlinkSync(oldFrontPath);
        }
      }
      updates.aadharFrontUrl =
        adharDirUrl + saveFile(aadharFront, adharDir, `${candidateId}_front`);
    }

    if (aadharBack) {
      if (userKyc?.aadharBackUrl) {
        const oldBackPath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          userKyc.aadharBackUrl
        );
        if (fs.existsSync(oldBackPath)) {
          fs.unlinkSync(oldBackPath);
        }
      }
      updates.aadharBackUrl =
        adharDirUrl + saveFile(aadharBack, adharDir, `${candidateId}_back`);
    }

    updates.status = "Review";

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
        { ...req.body, ...updates, kycVerificationCount: 1 },
        { transaction }
      );
    } else {
      await userKyc.update(
        { ...updates, kycVerificationCount: userKyc.kycVerificationCount + 1 },
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

    if (userKyc.status !== "Verified") {
      return res
        .status(403)
        .json({ error: "User Kyc is not verified yet by Admin!" });
    }

    if (userKyc.userAggreementAccepted) {
      return res
        .status(403)
        .json({ error: "User Kyc aggrement is alredy accepted by the User!" });
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

    // Fetch existing KYC entry for the user
    const userKyc = await user.getUserKyc();

    if (!userKyc) {
      return res.status(404).json({ error: "User must be KYC verified!" });
    }

    if (userKyc) {
      if (userKyc.status !== "Verified") {
        return res.status(404).json({ error: "User must be KYC verified!" });
      }
      if (userKyc.panStatus === "Review") {
        return res.status(402).json({ error: "Your PAN is under review!" });
      } else if (userKyc.panStatus === "Verified") {
        return res.status(402).json({ error: "PAN is already verified!" });
      }
    }

    // Extract and validate files
    const panFile = req.files?.panFile?.[0] || null;

    // Define directory paths
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

    let panUrl = userKyc.panUrl;

    // If PAN file is provided, handle the file saving and deletion
    if (panFile) {
      // Delete existing PAN file if it exists
      if (panUrl) {
        const existingPanFilePath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          panUrl
        );
        if (fs.existsSync(existingPanFilePath)) {
          fs.unlinkSync(existingPanFilePath);
        }
      }

      // Create directories if not exist
      fs.mkdirSync(baseDir, { recursive: true });
      fs.mkdirSync(panDir, { recursive: true });

      // Save new PAN file
      const saveFile = (file, dir, name) => {
        if (file) {
          const ext = path.extname(file.originalname);
          const filePath = path.join(dir, `${name}${ext}`);
          fs.writeFileSync(filePath, file.buffer);
          return name + ext;
        }
        return null;
      };

      panUrl = panDirUrl + saveFile(panFile, panDir, `${candidateId}_pan`);
    }

    const obj = { 
      panNumber: req.body.panNumber, 
      panUrl, 
      panStatus: "Review" 
    };

    // Check for duplicate PAN numbers
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

    // Update KYC details
    await userKyc.update(
      { ...obj, panVerificationCount: (userKyc.panVerificationCount || 0) + 1 },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({ message: "PAN details updated successfully." });
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};


exports.getUserKycInfo = async (req, res, next) => {
  try {
    const user = req.user;

    // Fetch existing PAN entry for the user
    const userKyc = await user.getUserKyc({
      attributes: [
        "dob",
        "address",
        "userAggreementAccepted",
        "adminMessageForKyc",
        "status",
        "aadharNumber",
        "aadharFrontUrl",
        "aadharBackUrl",
        "userUrl",
      ],
    });

    return res.json({
      kyc: userKyc,
      userInfo: {
        name: user.name,
        email: user.email,
        candidateId: user.candidateId,
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};

exports.getUserPanInfo = async (req, res, next) => {
  try {
    const user = req.user;

    // Fetch existing PAN entry for the user
    const userKyc = await user.getUserKyc({
      attributes: ["panNumber", "panUrl", "panStatus", "adminMessageForPan"],
    });

    return res.json({
      pan: userKyc,
      userInfo:{
        name:user.name,
        candidateId:user.candidateId
      }
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};
