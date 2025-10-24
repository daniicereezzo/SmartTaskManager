const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SyncStatus = sequelize.define('SyncStatus', {
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
  entityType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'entity_type'
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'entity_id'
  },
  lastSyncedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'last_synced_at'
  },
  syncStatus: {
    type: DataTypes.ENUM('pending', 'synced', 'conflict', 'error'),
    defaultValue: 'synced',
    field: 'sync_status'
  },
  deviceId: {
    type: DataTypes.STRING(255),
    field: 'device_id'
  }
}, {
  tableName: 'sync_status',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Associations
SyncStatus.associate = (models) => {
  SyncStatus.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

module.exports = SyncStatus;
