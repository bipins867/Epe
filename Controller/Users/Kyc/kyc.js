const fs = require("fs");
const path = require("path");
const UserKyc = require("../../../Models/Kyc/userKyc");

exports.postFormSubmit = async (req, res, next) => {
  try {
    // Extracting files
    const userImage = req.files["userImage"] ? req.files["userImage"][0] : null;
    const aadharFront = req.files["aadharFront"]
      ? req.files["aadharFront"][0]
      : null;
    const aadharBack = req.files["aadharBack"]
      ? req.files["aadharBack"][0]
      : null;
    const panFile = req.files["panFile"] ? req.files["panFile"][0] : null;

    // Extracting and formatting the email
    const email = req.body.email.replace(/\./g, "");

    // Base directory for storing files
    const baseDir = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "CustomerFiles",
      email
    );

    const baseUrl = "/files/" + email;

    // Create directories if they don't exist
    const adharDir = path.join(baseDir, "Adhar");
    const panDir = path.join(baseDir, "Pan");
    const userDir = path.join(baseDir, "User");

    const adharDirUrl = baseUrl + "/Adhar/";
    const panDirUrl = baseUrl + "/Pan/";
    const userDirUrl = baseUrl + "/User/";

    // Ensure the directories exist
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    if (!fs.existsSync(adharDir)) {
      fs.mkdirSync(adharDir);
    }
    if (!fs.existsSync(panDir)) {
      fs.mkdirSync(panDir);
    }
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
      adharDirUrl + saveFile(aadharFront, adharDir, `${email}_front`);
    const aadharBackUrl =
      adharDirUrl + saveFile(aadharBack, adharDir, `${email}_back`);
    const panUrl = panDirUrl + saveFile(panFile, panDir, `${email}_pan`);
    const userUrl = userDirUrl + saveFile(userImage, userDir, `${email}_user`);

    const obj = { ...req.body, aadharFrontUrl, aadharBackUrl, panUrl, userUrl };

    const user = req.user;

    const userKyc = await user.getUserKyc();
    obj.status = "Pending";
    if (!userKyc) {
      const userKyc = await user.createUserKyc({ ...obj });
    } else {
      await userKyc.update(obj);
    }
    // Responding to the client
    res.status(201).json({
      message: "Files and Data saved successfully",
    });
  } catch (err) {
    console.log(err);
    return res
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