const Admin = require("../../Models/User/admins");
const { Op } = require("sequelize");

exports.getAdminList = async (req, res, next) => {
  const admin = req.admin;

  try {
    if (admin.adminType == "SSA") {
      const admins = await Admin.findAll({
        where: {
          adminType: {
            [Op.ne]: "SSA", // 'Op.ne' stands for 'not equal' in Sequelize
          },
        },
      });

      res.status(201).json({ admins: admins, adminType: "SSA" });
    } else if (admin.adminType == "SA") {
      const admins = await Admin.findAll({
        where: {
          adminType: {
            [Op.notIn]: ["SSA", "SA"],
            // 'Op.ne' stands for 'not equal' in Sequelize
          },
        },
      });

      res.status(201).json({ admins: admins, adminType: "SA" });
    } else {
      res.status(401).json({ error: "Unauthorized Access!" });
    }
  } catch (err) {
    console.error("Error during admin login:", err);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};
