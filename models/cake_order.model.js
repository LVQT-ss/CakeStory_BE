import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const CakeOrder = sequelize.define('CakeOrder', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customer_id: { type: DataTypes.INTEGER, allowNull: false },
  shop_id: { type: DataTypes.INTEGER, allowNull: false },
  design_id: { type: DataTypes.INTEGER },
  marketplace_post_id: { type: DataTypes.INTEGER },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'cake_order',
  timestamps: false,
  underscored: true
});

export default CakeOrder;
