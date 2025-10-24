const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TimeConflict = sequelize.define('TimeConflict', {
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
  conflictDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'conflict_date'
  },
  conflictStartTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'conflict_start_time'
  },
  conflictEndTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'conflict_end_time'
  },
  conflictType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'conflict_type'
  },
  affectedTasks: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    allowNull: false,
    field: 'affected_tasks'
  },
  resolutionType: {
    type: DataTypes.STRING(50),
    field: 'resolution_type'
  },
  resolutionData: {
    type: DataTypes.JSONB,
    field: 'resolution_data'
  },
  resolvedAt: {
    type: DataTypes.DATE,
    field: 'resolved_at'
  }
}, {
  tableName: 'time_conflicts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Associations
TimeConflict.associate = (models) => {
  TimeConflict.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

module.exports = TimeConflict;
