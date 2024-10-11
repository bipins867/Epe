const { body, validationResult } = require("express-validator");

// Updated login validation: phone is required, email is no longer needed
const validateLogin = [
  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isNumeric()
    .withMessage("Phone number must be numeric")
    .isLength({ min: 10, max: 11 })
    .withMessage("Phone number must be between 10 and 11 digits"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

// Updated signup validation: email is optional, phone and name are required
const validateSignUp = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email")
    .optional() // Make email optional
    .isEmail()
    .withMessage("Invalid email address"),
  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isNumeric()
    .withMessage("Phone number must be numeric")
    .isLength({ min: 10, max: 11 })
    .withMessage("Phone number must be between 10 and 11 digits"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Za-z]/)
    .withMessage("Password must contain at least one letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain at least one special character"),
];

const validateChangePassword = [
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Za-z]/)
    .withMessage("Password must contain at least one letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain at least one special character"),
];

// Function to check validation errors and format response
const checkValidationErrors = (req, res, next) => {
  if (req.body.otpAuthenticationToken) {
    //console.log(req.body.otpType);
    if(!(req.body.otpType==='resetPassword')){
      //console.log("I am proceeded")
      return next();
    }
    
    
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = {};
    for (const e of errors.array()) {
      if (e.path === "") {
        err["emailOrPhone"] = e.msg;
      } else {
        err[e.path] = e.msg;
      }
    }
    return res.status(400).json({ errors: err });
  }
  next();
};

module.exports = {
  validateLogin,
  validateSignUp,
  validateChangePassword,
  checkValidationErrors,
};
