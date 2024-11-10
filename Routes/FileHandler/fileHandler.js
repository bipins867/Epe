const express = require("express");
const {
  setFileSizeLimit,
  checkFileSize,
  singleFileHandler,
  checkFileExist,
} = require("../../Middleware/fileHandler");

exports.fileHandlerRouter = (fileName, fileSize) => {
  const router = express.Router();

  router.use(
    setFileSizeLimit({ fileSizeLimit: fileSize,fileName:fileName }), // Corrected parameter name
    checkFileSize,
    singleFileHandler(fileName),
    checkFileExist
  );

  return router;
};
