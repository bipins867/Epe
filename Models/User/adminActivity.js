const { DataTypes } = require('sequelize');
const sequelize = require('../../database');

const AdminActivity = sequelize.define('AdminActivity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  
  activityType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  activitySubType:{
    type:DataTypes.STRING,
    allowNull:true
  },
  affectedUserId: {
    type: DataTypes.STRING,
    allowNull: true, // Nullable if the action doesn't involve a specific user
  },
  activityDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deviceType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'adminActivities',
  timestamps: false,
});

module.exports = AdminActivity;
