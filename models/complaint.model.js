import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const Complaint = sequelize.define('Complaint', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  order_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'cake_order',
      key: 'id'
    }
  },
  user_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'user',
      key: 'id'
    }
  },
  reason: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  evidence_images: { 
    type: DataTypes.STRING,
    allowNull: true 
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
  admin_note: { 
    type: DataTypes.TEXT,
    allowNull: true 
  },
  created_at: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  processed_at: { 
    type: DataTypes.DATE, 
    allowNull: true 
  },
  processed_by: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    references: {
      model: 'user',
      key: 'id'
    }
  }
}, {
  tableName: 'complaint',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['order_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    }
  ]
});

export default Complaint;