require("dotenv").config();
const cron = require('node-cron');
const { paymentVerifier, dailyInterestAdder, monthlyInterestBalanceUpdater } = require('./CronUtils/cronFunctions');

// Timezone for IST
const timeZone = 'Asia/Kolkata';

// Function for every hour at 1:00, 2:00, 3:00, etc. in IST
cron.schedule('0 * * * *', () => {
  console.log(`Payment status verification processed at ${new Date().toLocaleString("en-IN", { timeZone })}`);
  paymentVerifier();
}, {
  scheduled: true,
  timezone: timeZone
});

// Function for  midnight every day at 1:00 AM in IST
cron.schedule('0 1 * * *', () => {
  console.log(`Daily Interest updated at midnight in IST: ${new Date().toLocaleString("en-IN", { timeZone })}`);
  dailyInterestAdder();
}, {
  scheduled: true,
  timezone: timeZone
});

// Function for every 1st day of the month at 1:00 AM in IST
cron.schedule('0 1 1 * *', () => {
  console.log(`Monthly Interest added on the 1st day of the month at 1:00 AM in IST: ${new Date().toLocaleString("en-IN", { timeZone })}`);
  monthlyInterestBalanceUpdater();
}, {
  scheduled: true,
  timezone: timeZone
});
