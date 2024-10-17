const Admin = require("../../../Models/User/admins");
const { createAdminActivity } = require("../../../Utils/activityUtils");
const sequlize=require('../../../database')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


exports.adminLogin = async (req, res, next) => {
  const { userName, password } = req.body;
 
  try {
    // Check if the admin exists
    const admin = await Admin.findOne({ where: { userName } });

    if (!admin) {
      return res.status(404).json({ error: "Admin doesn't exist" }); // 404 Not Found
    }

    // Compare the provided password with the stored hashed password
    bcrypt.compare(password, admin.password, async (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res
          .status(500)
          .json({ error: "Internal server error. Please try again later." });
      }

      const expiresIn=process.env.NODE_ENV==='testing'?'2d':'5m';

      if (isMatch) {
        // Generate a JWT token
        const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET_KEY, {
          expiresIn: expiresIn, // Optional: specify token expiration time
        });
        await createAdminActivity(req,admin,'auth','Login Successfull');
        return res
          .status(201)
          .json({ status: "Login Successful", token, adminId: admin.id }); // 200 OK
      } else {
        await createAdminActivity(req,admin,'auth','Login Password verification failed!')
        return res.status(401).json({ error: "Invalid Password" }); // 401 Unauthorized
      }
    });
  } catch (err) {
    console.error("Error during admin login:", err);

    
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};
