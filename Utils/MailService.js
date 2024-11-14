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

async function sendSms(mobileNumber, message) {
  if (process.env.SMS_ENV !== "testing") {
    const apikey = process.env.SMS_API_KEY;
    const senderid = process.env.SMS_SENDER_ID;
    try {
      const url = `http://text.instavaluesms.in/V2/http-api.php?apikey=${apikey}&senderid=${senderid}&number=${mobileNumber}&message=${message}&format=json`;
      const response = await axios.get(url);
      const res = response.data;
      if (res.status !== "OK") {
        console.log("SMS API Error Response: ",res.message);
      }
      return response;
    } catch (e) {
      
      console.log("Error in sending SMS :- ", e.toString());
    }
  }
}

exports.sendRegistrationTemplate = async (mobileNumber, candidateId) => {
  let message = process.env.SMS_REGISTER_TEMPLATE;

  message = message.replace("{candidate_id}", candidateId);

  return await sendSms(mobileNumber, message);
};

exports.sendKycSuccessfullMessage = async (mobileNumber) => {
  let message = process.env.SMS_KYC_SUCCESSFULL;

  return await sendSms(mobileNumber, message);
};

exports.sendRewardMessage = async (mobileNumber, reward) => {
  let message = process.env.SMS_REWARD;

  message = message.replace("{reward}", reward);

  return await sendSms(mobileNumber, message);
};

exports.sendCreditMessage = async (
  mobileNumber,
  amount,
  customer_id,
  reference,
  available_balance
) => {
  let message = process.env.SMS_CREDIT;

  message = message.replace("{amount}", amount);
  message = message.replace("{customer_id}", customer_id);
  message = message.replace("{reference}", reference);
  message = message.replace("{available_balance}", available_balance);

  return await sendSms(mobileNumber, message);
};

exports.sendDebitMessage = async (
  mobileNumber,
  amount,
  customer_id,
  reference,
  available_balance
) => {
  let message = process.env.SMS_DEBIT;

  message = message.replace("{amount}", amount);
  message = message.replace("{customer_id}", customer_id);
  message = message.replace("{reference}", reference);
  message = message.replace("{available_balance}", available_balance);

  return await sendSms(mobileNumber, message);
};

exports.sendUserBlockMessage = async (mobileNumber) => {
  let message = process.env.SMS_BLOCK;

  return await sendSms(mobileNumber, message);
};

exports.sendUserUnblockMessage = async (mobileNumber) => {
  let message = process.env.SMS_UNBLOCK;

  return await sendSms(mobileNumber, message);
};

exports.sendSignUpOtpMessage = async (mobileNumber, otp) => {
  let message = process.env.SMS_OTP_SIGNUP;
  //console.log(message);
  message = message.replace("{otp}", otp);

  return await sendSms(mobileNumber, message);
};

exports.sendOtpAccountVerifyMessage = async (mobileNumber, otp) => {
  let message = process.env.SMS_OTP_VERIFY;
  message = message.replace("{otp}", otp);
  return await sendSms(mobileNumber, message);
};

exports.sendLoginOtpMessage = async (mobileNumber, otp) => {
  let message = process.env.SMS_OTP_LOGIN;
  message = message.replace("{otp}", otp);
  return await sendSms(mobileNumber, message);
};
