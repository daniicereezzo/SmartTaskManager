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
const initDatabase = async () => {
  try {
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database models synchronized successfully.');
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
