import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const CakeSize = sequelize.define('CakeSize', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  marketplace_post_id: { type: DataTypes.INTEGER, allowNull: false },
  size: { type: DataTypes.STRING, allowNull: false }, 
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, {
  tableName: 'cake_size',
  timestamps: true,
  underscored: true,
});

export default CakeSize;
