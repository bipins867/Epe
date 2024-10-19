const Announcement = require("../../../Models/Basic/announcement");
const AdminActivity = require("../../../Models/User/adminActivity");
const { createAdminActivity } = require("../../../Utils/activityUtils");
const sequelize = require("../../../database");

exports.getAllAnnouncement = async (req, res, next) => {
  try {
    const announcements = await Announcement.findAll();
    return res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.createAnnouncement = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { message, type } = req.body;
    const admin = req.admin; // Admin details are passed in req.admin

    // Create a new announcement
    const announcement = await Announcement.create(
      { message, type, isActive: true },
      { transaction: t }
    );

    // Log the admin activity
    await createAdminActivity(
      req,
      admin,
      "announcement",
      `Admin created a new announcement: ${message}`,
      null,
      t
    );

    await t.commit();
    return res.status(201).json({
      success: true,
      message: "Announcement created successfully.",
      data: announcement,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error creating announcement:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.updateAnnouncementStatus = async (req, res, next) => {
  let t;
  try {
    const { id, isActive } = req.body;
    const admin = req.admin;

    // Find and update the announcement's isActive status
    const announcement = await Announcement.findByPk(id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found." });
    }

    announcement.isActive = isActive;

    t = await sequelize.transaction();

    await announcement.save({ transaction: t });

    // Log the admin activity
    await createAdminActivity(
      req,
      admin,
      "announcement",
      `Admin updated announcement status for id: ${id} to ${isActive}`,
      null,
      t
    );

    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Announcement status updated successfully.",
      data: announcement,
    });
  } catch (error) {
    if (t) {
      await t.rollback();
    }
    console.error("Error updating announcement status:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.deleteAnnouncement = async (req, res, next) => {
  let t;
  try {
    const { id } = req.body;
    const admin = req.admin;

    // Find and delete the announcement
    const announcement = await Announcement.findByPk(id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found." });
    }
    t = await sequelize.transaction();

    await announcement.destroy({ transaction: t });

    // Log the admin activity
    await createAdminActivity(
      req,
      admin,
      "Delete Announcement",
      `Admin deleted announcement with id: ${id}`,
      null,
      t
    );

    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Announcement deleted successfully.",
    });
  } catch (error) {
    if (t) {
      await t.rollback();
    }
    console.error("Error deleting announcement:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
