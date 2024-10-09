const cron = require('node-cron');
const { paymentVerifier, dailyInterestAdder, monthlyInterestBalanceUpdater } = require('./CronUtils/cronFunctions');

// Function for every hour at 1:00, 2:00, 3:00, etc.
cron.schedule('0 * * * *', () => {
  console.log('Payment stuatus is verffication processed');
  paymentVerifier();
});

// Function for every day at midnight (24:00 or 00:00)
cron.schedule('0 0 * * *', () => {
  console.log('Daily Interest updated day at 00:00');
  dailyInterestAdder();
});

// Function for every 1st day of the month at 1:00 AM
cron.schedule('0 1 1 * *', () => {
  console.log('Monthly Interest added on 1-day of months at  1:00 AM');
  
  monthlyInterestBalanceUpdater();
});


//dailyInterestAdder();
//monthlyInterestBalanceUpdater()