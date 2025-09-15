import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const CakeOrder = sequelize.define('CakeOrder', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customer_id: { type: DataTypes.INTEGER, allowNull: false },
  shop_id: { type: DataTypes.INTEGER, allowNull: false },
  marketplace_post_id: { type: DataTypes.INTEGER, allowNull: true },
  base_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  ingredient_total: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0.00 },
  size: { type: DataTypes.STRING, allowNull: true },
  tier: { type: DataTypes.INTEGER, allowNull: true, },
  total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: {
    type: DataTypes.ENUM('pending', 'ordered', 'completed','cancelled', 'shipped', 'complaining', 'prepared'),
    allowNull: false,
    defaultValue: 'pending'
  },
  special_instructions: { type: DataTypes.TEXT },
  shipped_at: { type: DataTypes.DATE, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  delivery_time: { type: DataTypes.DATE, allowNull: true},
}, {
  tableName: 'cake_order',
  timestamps: true,
  underscored: true
});

export default CakeOrder;
