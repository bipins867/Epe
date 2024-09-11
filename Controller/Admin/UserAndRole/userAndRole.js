const adminAndRole = require("../../../Models/User/adminAndRole");
const Admin = require("../../../Models/User/admins");
const Role = require("../../../Models/User/role");

const {
  generateRandomUsername,
  generateRandomRoleId,
} = require("../../../Utils/utils");
const bcrypt = require("bcrypt");

exports.createSSAdmin = async (req, res, next) => {
  try {
    // Check if any SSA type admin already exists
    const existingSSA = await Admin.findOne({ where: { adminType: "SSA" } });
    if (existingSSA) {
      return res.status(400).json({
        message: "SSA type admin already exists. Cannot create another.",
      });
    }

    // Generate random username
    const userName = generateRandomUsername();

    // Extract password from request body
    const { password, name, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create the new SSA admin
    const newSSAAdmin = await Admin.create({
      userName,
      adminType: "SSA",
      password: hashedPassword,
      freezeStatus: false,
      name,
      email,
    });

    return res.status(201).json({
      message: "SSA type admin created successfully.",
      admin: newSSAAdmin,
    });
  } catch (error) {
    console.error("Error creating SSA admin:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.createSAdmin = async (req, res, next) => {
  try {
    // Extract name, email, and password from the request body
    const { name, email, password } = req.body;

    // Check if an admin with the same email already exists
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // Generate random username
    const userName = generateRandomUsername();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new SA admin
    const newSSAAdmin = await Admin.create({
      userName,
      adminType: "SA",
      password: hashedPassword,
      freezeStatus: false,
      name,
      email,
    });

    return res.status(201).json({
      message: "SA type admin created successfully.",
      admin: newSSAAdmin,
    });
  } catch (error) {
    console.error("Error creating SA admin:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.createAdmin = async (req, res, next) => {
  try {
    // Extract name, email, and password from the request body
    const { name, email, password } = req.body;

    // Check if an admin with the same email already exists
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // Generate random username
    const userName = generateRandomUsername();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new A admin
    const newAdmin = await Admin.create({
      userName,
      adminType: "A",
      password: hashedPassword,
      freezeStatus: false,
      name,
      email,
    });

    return res.status(201).json({
      message: "A type admin created successfully.",
      admin: newAdmin,
    });
  } catch (error) {
    console.error("Error creating A admin:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.deleteAdmin = async (req, res, next) => {
  try {
    // Extract the userName from request parameters
    const { userName } = req.params;
    const admin = req.admin;

    if (!(admin.adminType == "SSA" || admin.adminType == "SA")) {
      return res.status(401).json({ message: "Unauthorized Access!" });
    }

    // Find the admin by userName and delete
    const deletedAdmin = await Admin.destroy({
      where: { userName: userName },
    });

    // If no admin found with the provided userName
    if (!deletedAdmin) {
      return res.status(404).json({
        message: `Admin with userName ${userName} not found.`,
      });
    }

    // Return success response
    return res.status(200).json({
      message: `Admin with userName ${userName} deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    // Extract userName and new password from request body
    const { userName, password } = req.body;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find the admin by userName and update the password
    const updatedAdmin = await Admin.update(
      { password: hashedPassword },
      { where: { userName: userName } }
    );

    // Check if any admin was updated
    if (updatedAdmin[0] === 0) {
      // `updatedAdmin[0]` is the number of affected rows
      return res.status(404).json({
        message: `Admin with userName ${userName} not found.`,
      });
    }

    // Return success response
    return res.status(200).json({
      message: `Password for admin with userName ${userName} updated successfully.`,
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.updateAdminStatus = async (req, res, next) => {
  try {
    const { adminId, freezeStatus } = req.body; // Extract admin ID and new freeze status from request body

    // Validate input: Check if adminId and freezeStatus are provided
    if (typeof adminId === "undefined" || typeof freezeStatus === "undefined") {
      return res
        .status(400)
        .json({ error: "Admin ID and freeze status are required." });
    }

    // Find the admin by primary key (ID)
    const admin = await Admin.findByPk(adminId);

    // Check if admin exists
    if (!admin) {
      return res.status(404).json({ error: "Admin not found." });
    }

    // Update the admin's freeze status
    admin.freezeStatus = freezeStatus;

    // Save the changes to the database
    await admin.save();

    // Return a success message
    return res
      .status(200)
      .json({ message: "Admin freeze status updated successfully.", admin });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "An error occurred while updating the admin status." });
  }
};
exports.updateAdminRoles = async (req, res, next) => {
  try {
    const { userName, roles } = req.body;

    // Find the admin by userName
    const admin = await Admin.findOne({ where: { userName } });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Find roles by roleNames
    const roleModels = await Role.findAll({ where: { roleName: roles } });

    // Check if any roles were not found
    if (roleModels.length !== roles.length) {
      return res.status(404).json({ message: "One or more roles not found" });
    }

    // Find the existing roles for the admin
    const existingRoles = await admin.getRoles();

    // Create a Set of role IDs for quick lookup
    const existingRoleIds = new Set(existingRoles.map((role) => role.id));
    const newRoleIds = new Set(roleModels.map((role) => role.id));

    // Determine roles to add and roles to remove
    const rolesToAdd = roleModels.filter(
      (role) => !existingRoleIds.has(role.id)
    );
    const rolesToRemove = existingRoles.filter(
      (role) => !newRoleIds.has(role.id)
    );

    // Remove roles
    await admin.removeRoles(rolesToRemove);

    // Add new roles
    await admin.addRoles(rolesToAdd);

    return res.status(200).json({ message: "Roles updated successfully." });
  } catch (error) {
    console.error("Error updating roles:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.createRole = async (req, res, next) => {
  try {
    // Extract roleName from request body
    const { roleName, identifier } = req.body;

    // Generate a unique roleId
    const roleId = generateRandomRoleId();

    // Create the new role
    const newRole = await Role.create({
      roleId,
      roleName,
      identifier,
    });

    return res
      .status(201)
      .json({ message: "Role created successfully.", role: newRole });
  } catch (error) {
    console.error("Error creating role:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.deleteRole = async (req, res, next) => {
  try {
    // Extract roleId from request parameters
    const { roleId } = req.params;

    // Find the role by roleId
    const role = await Role.findOne({ where: { roleId } });

    if (!role) {
      return res.status(404).json({ message: "Role not found." });
    }

    // Delete the role
    await Role.destroy({ where: { roleId } });

    return res.status(200).json({ message: "Role deleted successfully." });
  } catch (error) {
    console.error("Error deleting role:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getRolesList = async (req, res, next) => {
  try {
    const userName = req.body.userName;

    const admin = await Admin.findOne({ where: { userName: userName } });

    // Fetch all roles from the database
    const roles = await Role.findAll();

    // Fetch active roles associated with the admin
    const activeRoles = await admin.getRoles();

    // Check if any roles are found
    if (roles.length === 0) {
      return res.status(404).json({ message: "No roles found." });
    }

    // Return the list of all roles and active roles
    return res.status(200).json({
      message: "Roles fetched successfully.",
      roles,
      activeRoles,
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
