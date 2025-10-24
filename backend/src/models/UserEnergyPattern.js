const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserEnergyPattern = sequelize.define('UserEnergyPattern', {
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
  timeSlotStart: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'time_slot_start'
  },
  timeSlotEnd: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'time_slot_end'
  },
  energyLevel: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: false,
    field: 'energy_level'
  },
  productivityScore: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.5,
    field: 'productivity_score',
    validate: {
      min: 0,
      max: 1
    }
  }
}, {
  tableName: 'user_energy_patterns',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Associations
UserEnergyPattern.associate = (models) => {
  UserEnergyPattern.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

module.exports = UserEnergyPattern;
