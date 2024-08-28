const User = require("../../../Models/User/users");
const axios = require("axios");

exports.getUserDetails = async (req, res, next) => {
  try {
    const emailId = req.params.emailId;
    const user = await User.findOne({ where: { email: emailId } });

    const userKyc = await user.getUserKyc();

    res.status(201).json({ userKyc: userKyc });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};

exports.updateKycStatus = async (req, res, next) => {
  try {
    const { email, status, message } = req.body;
    const user = await User.findOne({ where: { email: email } });

    const userKyc = await user.getUserKyc();

    if (status) {
      const obj = { status: "Approved", adminMessage: "" };
      await userKyc.update(obj);

      const apikey = process.env.SMS_API_KEY;
      const senderid = process.env.SMS_SENDER_ID;
      const message = process.env.SMS_TEMPLETE;
      const number = user.phone;

      const url = `http://text.instavaluesms.in/V2/http-api.php?apikey=${apikey}&senderid=${senderid}&number=${number}&message=${message}&format=json`;

      // Make the GET request
      const response = await axios.get(url);
    } else {
      const obj = { status: "Rejected", adminMessage: message };
      await userKyc.update(obj);
    }

    res.status(201).json({ message: "KYC updated successfully!" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};
