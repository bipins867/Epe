const fs = require("fs");
const path = require("path");
const UserKyc = require("../../../Models/Kyc/userKyc");
const { Op } = require("sequelize");
const { sendKycSuccessfullMessage } = require("../../../Utils/MailService");
const BankDetails = require("../../../Models/PiggyBox/bankDetails");
const sequelize = require("../../../database");

exports.postFormSubmit = async (req, res, next) => {
  let transaction;
  try {
    const user = req.user;

    // Fetch existing KYC entry for the user
    const userKyc = await user.getUserKyc();

    if (userKyc) {
      if (userKyc.status === "Pending") {
        return res.status(402).json({
          error: "Your Kyc is under review!",
        });
      } else if (userKyc.status === "Verified") {
        return res.status(402).json({
          error: "Kyc is already Verified!",
        });
      }
    }

    // Extracting files
    const userImage = req.files["userImage"] ? req.files["userImage"][0] : null;
    const aadharFront = req.files["aadharFront"]
      ? req.files["aadharFront"][0]
      : null;
    const aadharBack = req.files["aadharBack"]
      ? req.files["aadharBack"][0]
      : null;
    //const panFile = req.files["panFile"] ? req.files["panFile"][0] : null;

    // Extracting and formatting the phone
    //const phone = req.body.phone;
    const candidateId = req.user.candidateId;
    // Base directory for storing files
    const baseDir = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "CustomerFiles",
      candidateId
    );
    const baseUrl = "/files/" + candidateId;

    // Create directories if they don't exist
    const adharDir = path.join(baseDir, "Adhar");
    //const panDir = path.join(baseDir, "Pan");
    const userDir = path.join(baseDir, "User");

    const adharDirUrl = baseUrl + "/Adhar/";
    //const panDirUrl = baseUrl + "/Pan/";
    const userDirUrl = baseUrl + "/User/";

    // Ensure the directories exist
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    if (!fs.existsSync(adharDir)) {
      fs.mkdirSync(adharDir);
    }
    //if (!fs.existsSync(panDir)) {      fs.mkdirSync(panDir);    }

    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir);
    }

    // Function to move files to their respective directories
    const saveFile = (file, dir, name) => {
      if (file) {
        const ext = path.extname(file.originalname);
        const filePath = path.join(dir, `${name}${ext}`);

        fs.writeFileSync(filePath, file.buffer); // Save the file

        return name + ext;
      }
    };

    // Saving files with appropriate names
    const aadharFrontUrl =
      adharDirUrl + saveFile(aadharFront, adharDir, `${candidateId}_front`);
    const aadharBackUrl =
      adharDirUrl + saveFile(aadharBack, adharDir, `${candidateId}_back`);

    // const panUrl = panDirUrl + saveFile(panFile, panDir, `${candidateId}_pan`);

    const userUrl =
      userDirUrl + saveFile(userImage, userDir, `${candidateId}_user`);

    const obj = { ...req.body, aadharFrontUrl, aadharBackUrl, userUrl }; //panUrl

    // Check for duplicate Aadhaar or PAN numbers, excluding the current user's record
    const duplicateKyc = await UserKyc.findOne({
      where: {
        [Op.or]: [
          { aadharNumber: req.body.aadharNumber },
          //          { panNumber: req.body.panNumber },
        ],
        id: { [Op.ne]: userKyc ? userKyc.id : null }, // Exclude the current user's record
      },
    });

    if (duplicateKyc) {
      return res.status(400).json({
        error: "Aadhaar or PAN number already exists for another user.",
      });
    }

    // Fetch existing bank details
    const existingBankDetails = await BankDetails.findOne({
      where: { UserId: req.user.id },
    });

    transaction = await sequelize.transaction();

    await user.update(
      { email: req.body.email, name: req.body.name },
      { transaction }
    );

    if (existingBankDetails) {
      await existingBankDetails.update(
        { accountHolderName: req.body.name },
        { transaction }
      );
    }

    obj.status = "Pending";
    if (!userKyc) {
      // If no existing KYC entry, create a new one
      await user.createUserKyc(
        { ...obj, kycVerificationCount: 1 },
        { transaction }
      );
    } else {
      // Update the existing KYC entry
      await userKyc.update(
        {
          ...obj,
          kycVerificationCount: userKyc.kycVerificationCount + 1,
        },
        { transaction }
      );
    }

    await transaction.commit();

    // Responding to the client
    res.status(201).json({
      message: "Files and Data saved successfully",
    });
  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }
    console.log(err);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};



