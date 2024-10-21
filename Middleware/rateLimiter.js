const rateLimit = require("express-rate-limit");

const windowMs = 15 * 60 * 1000;

// Login Route Limiter
exports.userLoginLimiter = rateLimit({
  windowMs: windowMs, // 15 minutes
  max: 6, // 10 attempts per 15 minutes
  trustProxy: 1,
  handler: (req, res, next) => {
    res.status(429).json({
      message: "Too many login attempts, please try again after 15 minutes",
    });
  },
});

// Sign-Up Route Limiter
exports.userSignUpLimiter = rateLimit({
  windowMs: windowMs,
  max: 10, // 5 attempts per 15 minutes
  trustProxy: 1,
  handler: (req, res, next) => {
    res.status(429).json({
      message: "Too many sign-up attempts, please try again after 15 minutes",
    });
  },
});

// Sign-Up Route Limiter
exports.userAuthLimiter = rateLimit({
  windowMs: windowMs,
  max: 10, // 5 attempts per 15 minutes
  trustProxy: 1,
  handler: (req, res, next) => {
    res.status(429).json({
      message: "Too many auth attempts, please try again after 15 minutes",
    });
  },
});

exports.userResendOtpimiter = rateLimit({
  windowMs: windowMs,
  max: 20, // 5 attempts per 15 minutes
  trustProxy: 1,
  handler: (req, res, next) => {
    res.status(429).json({
      message: "Too many Resend Otp attempts, please try again after 15 minutes",
    });
  },
});



// KYC Update Limiter
exports.kycUpdateLimiter = rateLimit({
  windowMs: windowMs,
  max: 3,
  trustProxy: 1,
  handler: (req, res, next) => {
    res.status(429).json({
      message:
        "Too many KYC update attempts, please try again after 15 minutes",
    });
  },
});

// PiggyBox (Add Funds / Withdrawal) Limiter
exports.piggyBoxLimiter = rateLimit({
  windowMs: windowMs,
  max: 10,
  trustProxy: 1,
  handler: (req, res, next) => {
    res.status(429).json({
      message:
        "Too many requests for PiggyBox actions, please try again after 15 minutes",
    });
  },
});

// Transfer Money Limiter
exports.transferMoneyLimiter = rateLimit({
  windowMs: windowMs,
  max: 5,
  trustProxy: 1,
  handler: (req, res, next) => {
    res.status(429).json({
      message:
        "Too many money transfer attempts, please try again after 15 minutes",
    });
  },
});

// // Apply rate limiters to specific routes
// app.post('/login', loginLimiter, loginController);
// app.post('/signUp', signUpLimiter, signUpController);
// app.post('/kyc/update', kycLimiter, kycController);
// app.post('/piggybox/addFunds', piggyBoxLimiter, addFundsController);
// app.post('/piggybox/withdraw', piggyBoxLimiter, withdrawController);
// app.post('/transferMoney', transferMoneyLimiter, transferMoneyController);
