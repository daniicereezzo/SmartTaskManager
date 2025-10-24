const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TaskCategory = sequelize.define('TaskCategory', {
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
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#3B82F6',
    validate: {
      is: /^#[0-9A-F]{6}$/i
    }
  }
}, {
  tableName: 'task_categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Associations
TaskCategory.associate = (models) => {
  TaskCategory.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  TaskCategory.hasMany(models.Task, { foreignKey: 'categoryId', as: 'tasks' });
};

module.exports = TaskCategory;
