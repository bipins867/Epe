const path = require("path");

// Send the file if it exists

exports.getFile = (req, res, next) => {
  const { email, fileType, fileName } = req.params;

  // Resolve path to CustomerFiles from the Epe directory
  const baseDir = path.join(__dirname,'..', "..", "CustomerFiles");

  // Construct the file path
  const filePath = path.join(baseDir, email, fileType, fileName);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("File not found:", err);
      res.status(404).send("File not found");
    } else {
      console.log("File served successfully.");
    }
  });
};
