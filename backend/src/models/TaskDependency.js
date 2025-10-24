const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TaskDependency = sequelize.define('TaskDependency', {
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
  dependsOnTaskId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'depends_on_task_id',
    references: {
      model: 'tasks',
      key: 'id'
    }
  },
  dependencyType: {
    type: DataTypes.ENUM('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'),
    defaultValue: 'finish_to_start',
    field: 'dependency_type'
  }
}, {
  tableName: 'task_dependencies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['task_id', 'depends_on_task_id']
    }
  ]
});

// Associations
TaskDependency.associate = (models) => {
  TaskDependency.belongsTo(models.Task, { 
    foreignKey: 'taskId', 
    as: 'task',
    onDelete: 'CASCADE'
  });
  TaskDependency.belongsTo(models.Task, { 
    foreignKey: 'dependsOnTaskId', 
    as: 'dependsOnTask',
    onDelete: 'CASCADE'
  });
};

module.exports = TaskDependency;
