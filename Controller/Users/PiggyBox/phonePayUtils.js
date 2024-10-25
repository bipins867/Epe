const crypto = require("crypto");
const axios = require("axios");

// Generate track ID
function generateTrackId(regno) {
  const time = new Date();
  const trackId = `EPE${time.getFullYear().toString().slice(-2)}${(
    "0" +
    (time.getMonth() + 1)
  ).slice(-2)}${("0" + time.getDate()).slice(-2)}${regno}${Math.floor(
    100000 + Math.random() * 900000
  )}`;
  return trackId;
}

// Calculate checksum
function calculateChecksum(data, saltKey) {
  const hash = crypto.createHash("sha256").update(data).digest("hex");
  return `${hash}###${saltKey}`;
}

// Base64 URL Encode
function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Generate merchantUserId
function generateMerchantUserId(length = 32) {
  const validChars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";
  return Array.from(
    { length },
    () => validChars[Math.floor(Math.random() * validChars.length)]
  ).join("");
}

exports.savePaymentRequest = async function savePaymentRequest(
  candidateId,
  mobile,
  amount
) {
  const regNo = candidateId;

  let apiUrl, baseUrl, saltKey, merchantId, merchantUserId, saltIndex;
  //const mobile = "6393070710"; // Placeholder

  if (process.env.NODE_ENV === "testing") {
    apiUrl = process.env.PHONE_PAY_TEST_URL;
    saltKey = process.env.PHONE_PAY_TEST_SALT_KEY;
    merchantId = process.env.PHONE_PAY_TEST_MERCHANT_ID;
    saltIndex = process.env.PHONE_PAY_TEST_SALT_INDEX;
    baseUrl = `http://localhost:${process.env.APP_PORT}`;
  } else {
    apiUrl = process.env.PHONE_PAY_PRODUCTION_URL;
    saltKey = process.env.PHONE_PAY_PRODUCTION_SALT_KEY;
    merchantId = process.env.PHONE_PAY_PRODUCTION_MERCHANT_ID;
    saltIndex = process.env.PHONE_PAY_PRODUCTION_SALT_INDEX;
    baseUrl = "https://epeindia.in";
  }

  merchantUserId = generateMerchantUserId();
  const merchantTransactionId = generateTrackId(regNo);
  const payload = {
    merchantId,
    merchantUserId,
    merchantTransactionId,
    amount: amount * 100,
    redirectUrl: `${baseUrl}/user/piggyBox/post/redirectedPaymentInfo/${merchantTransactionId}`,
    redirectMode: "POST",
    callbackUrl: `${baseUrl}/user/piggyBox/post/callbackPaymentInfo/${merchantTransactionId}`,
    mobileNumber: mobile,
    paymentInstrument: { type: "PAY_PAGE" },
  };

  const payloadJson = JSON.stringify(payload);
  const concatenatedString =
    base64UrlEncode(payloadJson) + "/pg/v1/pay" + saltKey;
  const checksum = calculateChecksum(concatenatedString, saltIndex);

  const response = await axios.post(
    apiUrl,
    {
      request: base64UrlEncode(payloadJson),
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-Verify": checksum,
      },
    }
  );

  if (response.data.success) {
    // Further processing with response
    //console.log(response.data);

    const data = response.data;

    //console.log(data.data.instrumentResponse.redirectInfo)

    return { paymentResult: data, merchantTransactionId, merchantUserId };
  }
};

exports.verifyPaymentRequest = async function verifyPaymentRequest(
  merchantTransactionId
) {
  let saltKey, merchantId, saltIndex;
  //const mobile = "6393070710"; // Placeholder

  if (process.env.NODE_ENV === "testing") {
    saltKey = process.env.PHONE_PAY_TEST_SALT_KEY;
    merchantId = process.env.PHONE_PAY_TEST_MERCHANT_ID;
    saltIndex = process.env.PHONE_PAY_TEST_SALT_INDEX;
    url=`https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`
  } else {
    saltKey = process.env.PHONE_PAY_PRODUCTION_SALT_KEY;
    merchantId = process.env.PHONE_PAY_PRODUCTION_MERCHANT_ID;
    saltIndex = process.env.PHONE_PAY_PRODUCTION_SALT_INDEX;
    url=`https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`
  }

  const string =
    `/pg/v1/status/${merchantId}/${merchantTransactionId}` + saltKey;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + saltIndex;

  const options = {
    method: "GET",
    //url: ,
    url: url,
    
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": merchantId,
    },
  };

  const response = await axios.request(options);
  
  return response;
};
