import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const MarketplacePost = sequelize.define('MarketplacePost', {
  post_id: { type: DataTypes.INTEGER, primaryKey: true },
  shop_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  available: { type: DataTypes.BOOLEAN, defaultValue: true },
  expiry_date: { type: DataTypes.DATE },
  tier: { type: DataTypes.INTEGER, allowNull: true, },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  required_time: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0},
}, {
  tableName: 'marketplace_post',
  timestamps: false,
  underscored: true
});

export default MarketplacePost;
