require("dotenv").config();
const Sib = require("sib-api-v3-sdk");
const axios = require("axios");

const client = Sib.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.SMTP_API_KEY_2;

const tranEmailApi = new Sib.TransactionalEmailsApi();
const sender = {
  email: process.env.MAIL_SENDER_EMAIL,
};
// In app.js or a similar central file
exports.otpStore = {}; // Object to hold OTP data in memory

exports.sendMail = async (reciverEmail, subject, textContent) => {
  const reciver = [
    {
      email: reciverEmail,
    },
  ];
  // await tranEmailApi.sendTransacEmail({
  //   sender,
  //   to: reciver,
  //   subject: subject,
  //   textContent: textContent,
  // });
  try {
    const result = await tranEmailApi.sendTransacEmail({
      sender,
      to: reciver,
      subject: subject,
      textContent: textContent,
    });
    return result;
  } catch (err) {
    console.log(err);
    return false;
  }
};

exports.generateOtp = (min, max) => {
  const data = Math.random() * (max - min) + min;
  return parseInt(data);
};

exports.sendOtp = async (mobileNumber, otp) => {
  const apikey = process.env.SMS_API_KEY;
  const senderid = process.env.SMS_SENDER_ID;
  let message = process.env.SMS_OTP_TEMPLETE;
  const number = mobileNumber;
  
  message = message.replace("{otp}", otp);
  
  const url = `http://text.instavaluesms.in/V2/http-api.php?apikey=${apikey}&senderid=${senderid}&number=${number}&message=${message}&format=json`;
  const response= await axios.get(url);
 
  //console.log(response.data);
  return response;
};



exports.sendRegistrationTemplate=async (mobileNumber, candidateId) => {
  const apikey = process.env.SMS_API_KEY;
  const senderid = process.env.SMS_SENDER_ID;
  let message = process.env.SMS_REGISTER_TEMPLATE;
  const number = mobileNumber;
  
  message = message.replace("{customer_id}", candidateId);
  message = message.replace("{password}", '*********');
  
  
  const url = `http://text.instavaluesms.in/V2/http-api.php?apikey=${apikey}&senderid=${senderid}&number=${number}&message=${message}&format=json`;
  const response= await axios.get(url);
  // console.log(url)
  // console.log("*************")
  // console.log(response.data);
  return response;
};