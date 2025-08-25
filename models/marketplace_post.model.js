import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';
import Shop from './shop.model.js';
import User from './user.model.js';
import Post from './post.model.js';

const MarketplacePost = sequelize.define('MarketplacePost', {
  post_id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true,
    references: { model: Post, key: 'id' },
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
  user_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: User, key: 'id' },
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  },
  available: { type: DataTypes.BOOLEAN, defaultValue: true },
  expiry_date: { type: DataTypes.DATE },
  tier: { type: DataTypes.INTEGER, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'marketplace_post',
  timestamps: false,
  underscored: true
});

export default MarketplacePost;
