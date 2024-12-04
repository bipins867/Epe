const { check, validationResult } = require("express-validator");
const multer = require("multer");
// Manual file size validation middleware
const fileSizeLimit = 20 * 1024 * 1024; // 2MB in bytes

exports.checkFileSize = (req, res, next) => {
  // Check if Content-Length header exists and is within the limit
  const contentLength = parseInt(req.headers["content-length"], 10);

  if (contentLength > fileSizeLimit) {
    return res.status(400).json({ error: "File size exceeds the 20MB limit." });
  }

  next();
};

// Your existing Multer middleware
const fileDataMiddleware = (fields) => {
  const storage = multer.memoryStorage();

  const uploads = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      // Optional: Check for allowed file types (e.g., images)
      const fileTypes = /jpeg|jpg|png/;
      const extname = fileTypes.test(
        file.originalname.toLowerCase().split(".").pop()
      );
      if (extname) {
        cb(null, true);
      } else {
        cb(
          new Error("Invalid file type. Only JPEG, JPG, and PNG are allowed.")
        );
      }
    },
  }).fields(fields);

  return (req, res, next) => {
    uploads(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  };
};

exports.kycValidator = [
  check("dob")
    .isISO8601()
    .withMessage("Date of birth must be in YYYY-MM-DD format."),
  check("aadharNumber")
    .isLength({ min: 12, max: 12 })
    .withMessage("Aadhar number must be 12 digits.")
    .isNumeric()
    .withMessage("Aadhar number must be numeric."),
  // check("panNumber")
  //   .isLength({ min: 10, max: 10 })
  //   .withMessage("PAN number must be 10 characters.")
  //   .matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/)
  //   .withMessage("PAN number must be in a valid format (e.g., ABCDE1234F)."),
  check("address").notEmpty().withMessage("Address is required."),
  check("customerId").notEmpty().withMessage("Customer ID is required."),
];

exports.panValidator = [
  check("panNumber")
    .isLength({ min: 10, max: 10 })
    .withMessage("PAN number must be 10 characters.")
    .matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/)
    .withMessage("PAN number must be in a valid format (e.g., ABCDE1234F)."),
];

exports.validateKyc = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = {};
    for (const e of errors.array()) {
      err[e.path] = e.msg;
    }

    return res.status(400).json({ errors: err });
  }
  next();
};
