const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  googleId: {
    type: DataTypes.STRING(255),
    unique: true,
    field: 'google_id'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  pictureUrl: {
    type: DataTypes.TEXT,
    field: 'picture_url'
  },
  timezone: {
    type: DataTypes.STRING(100),
    defaultValue: 'UTC'
  },
  themePreference: {
    type: DataTypes.ENUM('light', 'dark'),
    defaultValue: 'light',
    field: 'theme_preference'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Associations
User.associate = (models) => {
  User.hasMany(models.Task, { foreignKey: 'userId', as: 'tasks' });
  User.hasMany(models.TaskCategory, { foreignKey: 'userId', as: 'categories' });
  User.hasMany(models.UserDailyPreference, { foreignKey: 'userId', as: 'dailyPreferences' });
  User.hasMany(models.ScheduledSlot, { foreignKey: 'userId', as: 'scheduledSlots' });
  User.hasMany(models.UserEnergyPattern, { foreignKey: 'userId', as: 'energyPatterns' });
  User.hasMany(models.TimeConflict, { foreignKey: 'userId', as: 'timeConflicts' });
  User.hasMany(models.SyncStatus, { foreignKey: 'userId', as: 'syncStatus' });
};

module.exports = User;
