import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';
import User from './user.model.js';
import Shop from './shop.model.js';
import MarketplacePost from './marketplace_post.model.js';

const CakeOrder = sequelize.define('CakeOrder', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customer_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: User, key: 'id' },
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  },
  shop_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: Shop, key: 'shop_id' },
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  },
  marketplace_post_id: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    references: { model: MarketplacePost, key: 'post_id' },
    onDelete: "SET NULL",
    onUpdate: "CASCADE"
  },
  base_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  ingredient_total: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0.00 },
  size: { type: DataTypes.STRING, allowNull: true },
  tier: { type: DataTypes.INTEGER, allowNull: true },
  total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: {
    type: DataTypes.ENUM('pending', 'ordered', 'completed','cancelled', 'shipped', 'complaining', 'prepared'),
    allowNull: false,
    defaultValue: 'pending'
  },
  special_instructions: { type: DataTypes.TEXT },
  shipped_at: { type: DataTypes.DATE, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'cake_order',
  timestamps: true,
  underscored: true
});

export default CakeOrder;
