const express = require("express");
const User = require("./Models/User/users");
const geoip = require("geoip-lite");

const router = express.Router();

router.use("/getServerInfo", (req, res, next) => {
  return res.status(200).json({
    socketPort: process.env.SOCKET_PORT,
    nodeEnv: process.env.NODE_ENV,
  });
});


// Route to display information in HTML
router.use('/testWebsite', async (req, res, next) => {
  try {
    // Simulate user data
    const user = await User.findAll({ limit: 1 });

    let currentDate = new Date();

    // Convert to IST by adding 5 hours and 30 minutes to UTC
    let istDate = new Date(currentDate.getTime())// + 5.5 * 60 * 60 * 1000);

    // Format the IST date and time
    let formattedISTDate = istDate.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
    });

    // Constructing HTML response
    let htmlResponse = `
      <html>
      <head>
        <title>Client Info and Date</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          h2 {
            color: #333;
          }
          p {
            font-size: 1.1em;
            color: #555;
          }
          ul {
            list-style-type: none;
            padding: 0;
          }
          li {
            padding: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Client Information and Current Date & Time</h2>
          <p><strong>Current Time in IST:</strong> ${formattedISTDate}</p>
          <p><strong>Primary IP Address:</strong> ${req.clientInfo.primaryIpAddress}</p>
          <p><strong>Primary Location (Geolocation):</strong> ${req.clientInfo.location}</p>
          
          <h3>All IP Addresses and Locations:</h3>
          <ul>
    `;

    // Loop through each IP and get their locations
    for (const ip of req.clientInfo.ipAddresses) {
      const geoData = geoip.lookup(ip);
      const loc = geoData ? `${geoData.city}, ${geoData.country}` : "Unknown";
      htmlResponse += `<li><strong>IP Address:</strong> ${ip} - <strong>Location:</strong> ${loc}</li>`;
    }

    // Closing the HTML response
    htmlResponse += `
          </ul>
          <p><strong>User-Agent:</strong> ${req.clientInfo.userAgent}</p>
          <p><strong>Device Type:</strong> ${req.clientInfo.deviceType}</p>
        </div>
      </body>
      </html>
    `;

    // Send the HTML response
    res.send(htmlResponse);
  } catch (err) {
    console.log(err);
    res.send('<h1>Internal Server Error!</h1>');
  }
});



module.exports = router;
