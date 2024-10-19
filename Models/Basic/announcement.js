const { DataTypes } = require('sequelize');
const sequelize=require('../../database')


const Announcement = sequelize.define('Announcement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'announcements', // Optional: specify table name if different from model name
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

module.exports = Announcement;
