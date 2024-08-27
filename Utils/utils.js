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