const fs = require("fs");
const path=require('path');

function createFilePath(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath, { recursive: true });
  }
}
exports.saveFile = (file, dir, name) => {
  
  if (file) {
    const ext = path.extname(file.originalname);
    const filePath = path.join(dir, `${name}${ext}`);

    createFilePath(dir);
    fs.writeFileSync(filePath, file.buffer); // Save the file
    
    return name + ext;
  }
};
