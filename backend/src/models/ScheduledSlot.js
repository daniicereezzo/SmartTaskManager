const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ScheduledSlot = sequelize.define('ScheduledSlot', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  taskId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'task_id',
    references: {
      model: 'tasks',
      key: 'id'
    }
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
  scheduledDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'scheduled_date'
  },
  scheduledStartTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'scheduled_start_time'
  },
  scheduledEndTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'scheduled_end_time'
  },
  isConfirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_confirmed'
  }
}, {
  tableName: 'scheduled_slots',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Associations
ScheduledSlot.associate = (models) => {
  ScheduledSlot.belongsTo(models.Task, { foreignKey: 'taskId', as: 'task' });
  ScheduledSlot.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

module.exports = ScheduledSlot;
