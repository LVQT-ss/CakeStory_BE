import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';
import MarketplacePost from './marketplace_post.model.js';

const CakeSize = sequelize.define('CakeSize', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  marketplace_post_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: MarketplacePost, key: 'post_id' },
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  },
  size: { type: DataTypes.STRING, allowNull: false }, 
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, {
  tableName: 'cake_size',
  timestamps: true,
  underscored: true,
});

export default CakeSize;
