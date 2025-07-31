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
    allowNull: true,
    references: {
      model: 'wallet',
      key: 'id'
    }
  },
  to_wallet_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'wallet',
      key: 'id'
    }
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'cake_order',
      key: 'id'
    }
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
    allowNull: true,
    references: {
      model: 'ai_generated_image',
      key: 'id'
    }
  }
}, {
  tableName: 'transaction',
  timestamps: false,
  underscored: true
});

export default Transaction;