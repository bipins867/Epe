const jwt = require("jsonwebtoken");
const User = require("../Models/User/users");
const Admin = require("../Models/User/admins");
const CaseMessage = require("../Models/CustomerSupport/caseMessage");
const CaseUser = require("../Models/CustomerSupport/caseUser");
const CustomerCase = require("../Models/CustomerSupport/customerCase");
const Role = require("../Models/User/role");

exports.userAuthentication = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findByPk(payload.id);

    req.user = user;

    next();
  } catch (err) {
    return res.status(503).json({ error: "Invalid Signature!" });
  }
};

exports.adminAuthentication = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    // Verify the JWT token and extract the payload
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Find the admin by primary key (id)
    const admin = await Admin.findByPk(payload.id);

    // Check if the admin exists
    if (!admin) {
      return res.status(404).json({ error: "Admin not found!" });
    }

    // Check freeze status for admin types 'SA' and 'A'
    if (
      (admin.adminType === "SA" || admin.adminType === "A") &&
      admin.freezeStatus
    ) {
      return res
        .status(403)
        .json({ error: "Access denied. Admin account is frozen!" });
    }

    // Assign the admin object to the request object
    req.admin = admin;

    // Proceed to the next middleware
    next();
  } catch (err) {
    
    return res.status(503).json({ error: "Invalid Signature!" });
  }
};
exports.userChatSupportAuthentication = async (req, res, next) => {
  try {
    const token = req.headers.chattoken;

    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const customerCase = await CustomerCase.findOne({
      where: { caseId: payload.caseNumber },
    });

    const caseUser = await CaseUser.findByPk(customerCase.CaseUserId);

    if (!caseUser && !customerCase) {
      throw new Error("User or Case not found!");
    }
    req.caseUser = caseUser;
    req.customerCase = customerCase;

    next();
  } catch (err) {
    return res.status(503).json({ error: "Invalid Signature!" });
  }
};

exports.roleSAuthentication = async (req, res, next) => {
  try {
    const admin = req.admin;

    if (!(admin.adminType == "SSA" || admin.adminType == "SA")) {
      throw new Error("Un-Authorized Access!");
    }

    next();
  } catch (err) {
    return res.status(403).json({ error: "Un-Authorized Access!" });
  }
};

exports.roleSSAuthentication = async (req, res, next) => {
  try {
    const admin = req.admin;

    if (admin.adminType != "SSA") {
      throw new Error("Un-Authorized Access!");
    }

    next();
  } catch (err) {
    return res.status(403).json({ error: "Un-Authorized Access!" });
  }
};

exports.roleAuthentication = async (req, res, next) => {
  try {
    const admin = req.admin; // The admin object from the request
    const roleId = req.roleId; // The role ID to check against
    
    // If the admin type is SSA or SA, bypass verification
    if (admin.adminType === "SSA" || admin.adminType === "SA") {
      return next(); // Directly proceed to the next middleware
    }

    // Check if the admin type is 'A' and perform role verification
    if (admin.adminType === "A") {
      // Check if the admin has the role associated with the provided roleId
      const hasAccess = await admin.getRoles({
        where: { roleId: roleId }, // Check if the role with the specified ID is associated
      });

      // If the admin has access to the role, proceed to the next middleware
      if (hasAccess && hasAccess.length > 0) {
        return next();
      }
    }

    // If verification fails or admin type is not 'SSA' or 'SA', deny access
    return res.status(403).json({ error: "Unauthorized Access!" });
  } catch (err) {
    console.error(err);
    return res.status(403).json({ error: "Unauthorized Access!" });
  }
};
