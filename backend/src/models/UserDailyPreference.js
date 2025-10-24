const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserDailyPreference = sequelize.define('UserDailyPreference', {
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
  dayOfWeek: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'day_of_week',
    validate: {
      min: 0,
      max: 6
    }
  },
  availableStartTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'available_start_time'
  },
  availableEndTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'available_end_time'
  },
  energyLevel: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
    field: 'energy_level'
  }
}, {
  tableName: 'user_daily_preferences',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'day_of_week']
    }
  ]
});

// Associations
UserDailyPreference.associate = (models) => {
  UserDailyPreference.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

module.exports = UserDailyPreference;
