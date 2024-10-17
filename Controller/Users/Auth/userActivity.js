const UserActivity = require("../../../Models/User/userActivity")
const {Op} =require('sequelize')

exports.getUserActivityHistory = async (req, res, next) => {
  const { fromDate, toDate, limit, activityType } = req.body; // Extract filter parameters from request body
  const userId = req.user.id; // Get the user's ID from req.user
  
  try {
    // Prepare the filter conditions
    let whereConditions = { UserId: userId }; // UserId must match the logged-in user
    
    // Add activityType filter if provided and not 'All'
    if (activityType && activityType !== 'All') {
      whereConditions.activityType = activityType;
    }

    // Add date range filter if both fromDate and toDate are provided
    if (fromDate && toDate) {
      whereConditions.createdAt = {
        [Op.between]: [new Date(fromDate), new Date(toDate)] // Filter by date range
      };
    }

    // Set default limit to 20 if not provided
    const resultLimit = limit ? parseInt(limit) : 20;

    // Fetch user activities with filters and order by most recent
    const userActivities = await UserActivity.findAll({
      where: whereConditions,
      order: [["createdAt", "DESC"]],
      limit: resultLimit,
    });

    // If no activities found
    if (userActivities.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No activities found for the user."
      });
    }

    // Respond with the activities
    res.status(200).json({
      success: true,
      data: userActivities,
    });
  } catch (error) {
    console.error("Error fetching user activity history:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user activity history."
    });
  }
};
