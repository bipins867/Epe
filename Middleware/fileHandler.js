const multer = require("multer");

exports.setFileSizeLimit = ({ fileSizeLimit = 0.5 ,fileName=""}) => {
  return (req, res, next) => {
    req.fileName=fileName
    req.fileSizeLimit = fileSizeLimit * 1024 * 1024; // Convert MB to bytes
    next();
  };
};

exports.checkFileSize = (req, res, next) => {
  // Check if Content-Length header exists and is within the limit
  const contentLength = parseInt(req.headers["content-length"], 10);

  if (contentLength > req.fileSizeLimit) {
    return res.status(400).json({
      error: `File size exceeds the ${
        req.fileSizeLimit / (1024 * 1024)
      } MB limit. Current Size: ${contentLength / (1024 * 1024)} MB`,
    });
  }
  next();
};

exports.singleFileHandler = (fileName) => {
  const fields = [{ name: fileName, maxCount: 1 }];
  const storage = multer.memoryStorage();

  return multer({
    storage: storage,
  }).fields(fields);
};


exports.checkFileExist=(req,res,next)=>{
  
  if(req.fileName){
    return next();
  }
  res.status(404).json({error:"File not Found!"})
}