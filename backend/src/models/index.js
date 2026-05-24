const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Task = require('./Task');
const TaskCategory = require('./TaskCategory');
const UserDailyPreference = require('./UserDailyPreference');
const ScheduledSlot = require('./ScheduledSlot');
const UserEnergyPattern = require('./UserEnergyPattern');
const TimeConflict = require('./TimeConflict');
const SyncStatus = require('./SyncStatus');
const TaskDependency = require('./TaskDependency');

// Define associations
const models = {
  User,
  Task,
  TaskCategory,
  UserDailyPreference,
  ScheduledSlot,
  UserEnergyPattern,
  TimeConflict,
  SyncStatus,
  TaskDependency
};

// Set up associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Initialize database
// NOTE: automatic schema `alter` can try to perform unsafe casts on Postgres enums
// (for example: "default for column \"theme_preference\" cannot be cast automatically to type enum_users_theme_preference").
// To avoid that at runtime we avoid using `alter` here and prefer running the SQL migrations
// (npm run migrate) during setup. This keeps server startup safer in development environments
// where the database schema may already exist.
const initDatabase = async () => {
  try {
    // Do not run automatic `alter` on startup to prevent unsafe ALTER TYPE operations
    await sequelize.sync({ alter: false });
    console.log('Database models synchronized successfully (no alter).');
  } catch (error) {
    console.error('Error synchronizing database models:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  ...models,
  initDatabase
};
