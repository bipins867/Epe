require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const useragent = require("express-useragent");
const geoip = require("geoip-lite");

const { setupRoutes } = require("./Routes/setupRoutes");
const db = require("./database");
const infoRoutes=require('./infoRoutes')
//const { sendOtp, sendKycSuccessfullMessage, sendRewardMessage, sendCreditMessage, sendDebitMessage } = require("./Utils/MailService");

require("./Models/setModels");
require("./Server-Socket/server");
require("./cronTimerFunctionController");

//sendOtp(6393070710,5555)
//sendKycSuccessfullMessage(6393070710)
//sendRewardMessage(6393070710,500)
//sendCreditMessage(6393070710,100,123456,'REF556',600)
//sendDebitMessage(6393070710,100,123456,'REF1234',600)

// Just check
app = express();
app.use(express.static(path.join(__dirname, "Public")));
app.use(express.static(path.join(__dirname, "CustomerFiles")));
app.use(express.static(path.join(__dirname, "CustomerSupport")));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);

app.use(bodyParser.json({ extends: false }));

// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // Limit each IP to 100 API requests per window
//   message: 'Too many requests from this IP, please try again later.',
// });

// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per window
//   handler: (req, res) => {
//       res.status(429);
//       // Send the HTML file when the rate limit is exceeded
//       res.sendFile(path.join(__dirname, 'public', 'rate-limit.html'));
//   }
// });

// app.use('/', apiLimiter);

const activityLogger = (req, res, next) => {
  // Extracting IP Addresses (could be a list separated by commas)
  const ipAddresses = req.headers["x-forwarded-for"]
    ? req.headers["x-forwarded-for"].split(',').map(ip => ip.trim())
    : [req.connection.remoteAddress];

  // Extract the first IP as the primary client IP (most likely the original client IP)
  const primaryIpAddress = ipAddresses[0];

  // Extracting User-Agent
  const userAgent = req.headers["user-agent"];

  // Device Type (Desktop/Mobile/Tablet)
  const ua = useragent.parse(userAgent);
  const deviceType = ua.isMobile ? "Mobile" : "Desktop"; // Can also check ua.isTablet, ua.isBot, etc.

  // Geolocation based on the primary IP Address
  const geo = geoip.lookup(primaryIpAddress);
  const location = geo ? `${geo.city}, ${geo.country}` : "Unknown";

  req.clientInfo = {
    ipAddresses, // Array of IPs
    primaryIpAddress, // First IP as the primary one
    userAgent,
    deviceType,
    location,
  };

  // Continue with next middleware or response
  next();
};

app.use(activityLogger);


app.use('/',infoRoutes)

setupRoutes(app);

db.sync({alter:true})
  .then(() => {
    app.listen(process.env.APP_PORT);
    console.log(`Lisining to the port : ${process.env.APP_PORT}`);
  })
  .catch((err) => console.log(err));
