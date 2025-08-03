import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const CakeOrder = sequelize.define('CakeOrder', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customer_id: { type: DataTypes.INTEGER, allowNull: false },
  shop_id: { type: DataTypes.INTEGER, allowNull: false },
  marketplace_post_id: { type: DataTypes.INTEGER, allowNull: true },
  base_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  ingredient_total: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0.00 },
  total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: {
    type: DataTypes.ENUM('pending', 'ordered', 'completed','cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  special_instructions: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'cake_order',
  timestamps: false,
  underscored: true
});

export default CakeOrder;
