import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  transactionNumber: { type: DataTypes.INTEGER },
  price: { type: DataTypes.INTEGER },
  subcriptionType: {
    type: DataTypes.ENUM('free', 'VIP', 'Pro', 'Bussiness')
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled')
  }
}, {
  tableName: 'transaction',
  timestamps: false,
  underscored: true
});

export default Transaction;
