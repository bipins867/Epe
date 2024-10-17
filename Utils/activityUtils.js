const AdminActivity = require("../Models/User/adminActivity");
const UserActivity = require("../Models/User/userActivity");



exports.createUserActivity = async (
  req,
  user,
  activityType,
  activityDescription,
  transaction
) => {
  if (transaction) {
    return await UserActivity.create(
      {
        activityType: activityType,
        activityDescription: activityDescription,
        ipAddress: req.clientInfo.primaryIpAddress,
        userAgent: req.clientInfo.userAgent,
        location: req.clientInfo.location,
        deviceType: req.clientInfo.deviceType,
        createdAt: new Date(),
        UserId: user.id, // Link activity to the User
      },
      { transaction: transaction }
    );
  } else {
    return await UserActivity.create({
      activityType: activityType,
      activityDescription: activityDescription,
      ipAddress: req.clientInfo.primaryIpAddress,
      userAgent: req.clientInfo.userAgent,
      location: req.clientInfo.location,
      deviceType: req.clientInfo.deviceType,
      createdAt: new Date(),
      UserId: user.id, // Link activity to the User
    });
  }
};

exports.createAdminActivity = async (
  req,
  admin, // Admin performing the action
  activityType,
  activityDescription,
  affectedUserName,// Affected user name (can be null if not applicable)
  transaction
) => {
  const activityData = {
    activityType: activityType,
    activityDescription: activityDescription,
    affectedUserId: affectedUserName ? affectedUserName : null, // Set the affectedUserName if applicable
    ipAddress: req.clientInfo.primaryIpAddress,
    userAgent: req.clientInfo.userAgent,
    location: req.clientInfo.location,
    deviceType: req.clientInfo.deviceType,
    createdAt: new Date(),
    AdminId: admin.id, // Link activity to the Admin performing the action
  };

  if (transaction) {
    return await AdminActivity.create(activityData, { transaction });
  } else {
    return await AdminActivity.create(activityData);
  }
};
