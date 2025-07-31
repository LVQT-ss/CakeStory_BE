import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  from_wallet_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  to_wallet_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  transaction_type: {
    type: DataTypes.ENUM('order_payment', 'refund', 'ai_generation'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ai_generated_image_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'transaction',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  underscored: true
});

export default Transaction;