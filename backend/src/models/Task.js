const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  categoryId: {
    type: DataTypes.UUID,
    field: 'category_id',
    references: {
      model: 'task_categories',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  taskType: {
    type: DataTypes.ENUM('mandatory', 'desired', 'arrangable'),
    allowNull: false,
    field: 'task_type'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'end_date'
  },
  startTime: {
    type: DataTypes.TIME,
    field: 'start_time'
  },
  endTime: {
    type: DataTypes.TIME,
    field: 'end_time'
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'duration_minutes'
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 5
    }
  },
  workloadEnergy: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
    field: 'workload_energy'
  },
  googleCalendarEventId: {
    type: DataTypes.STRING(255),
    field: 'google_calendar_event_id'
  },
  googleCalendarId: {
    type: DataTypes.STRING(255),
    field: 'google_calendar_id'
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_recurring'
  },
  recurrencePattern: {
    type: DataTypes.JSONB,
    field: 'recurrence_pattern'
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  completionPercentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'completion_percentage',
    validate: {
      min: 0,
      max: 100
    }
  },
  alarmMinutesBefore: {
    type: DataTypes.INTEGER,
    defaultValue: 15,
    field: 'alarm_minutes_before'
  },
  notificationEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'notification_enabled'
  },
  scheduledAt: {
    type: DataTypes.DATE,
    field: 'scheduled_at'
  },
  completedAt: {
    type: DataTypes.DATE,
    field: 'completed_at'
  }
}, {
  tableName: 'tasks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Associations
Task.associate = (models) => {
  Task.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  Task.belongsTo(models.TaskCategory, { foreignKey: 'categoryId', as: 'category' });
  Task.hasMany(models.ScheduledSlot, { foreignKey: 'taskId', as: 'scheduledSlots' });
  Task.hasMany(models.TaskDependency, { 
    foreignKey: 'taskId', 
    as: 'dependencies',
    onDelete: 'CASCADE'
  });
  Task.hasMany(models.TaskDependency, { 
    foreignKey: 'dependsOnTaskId', 
    as: 'dependentTasks',
    onDelete: 'CASCADE'
  });
};

module.exports = Task;
