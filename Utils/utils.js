const multer = require("multer");

exports.fileDataMiddleware = (fields, maxFileSize) => {
  const storage = multer.memoryStorage();

  const uploads = multer({
    storage: storage,
    limits: {
      fileSize: maxFileSize, // Set the maximum file size limit
    },
  });

  return uploads.fields(fields);
};


exports.generateRandomUsername = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLetters = letters.charAt(Math.floor(Math.random() * 26)) + letters.charAt(Math.floor(Math.random() * 26));
  const randomNumbers = Math.floor(100000 + Math.random() * 900000); // 6 random digits
  return randomLetters + randomNumbers;
};

exports.generateRandomRoleId = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  const randomLetters = 
    letters.charAt(Math.floor(Math.random() * 26)) + 
    letters.charAt(Math.floor(Math.random() * 26));

  const randomNumbers = 
    numbers.charAt(Math.floor(Math.random() * 10)) +
    numbers.charAt(Math.floor(Math.random() * 10));

  return randomLetters + randomNumbers;
};