import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';
import Shop from './shop.model.js';

const Ingredient = sequelize.define('Ingredient', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  shop_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: Shop, key: 'shop_id' },
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  },
  name: { type: DataTypes.STRING(255), allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  image: { type: DataTypes.STRING, allowNull: true }, 
  description: { type: DataTypes.TEXT, allowNull: true }, 
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true, 
  }
}, {
  tableName: 'ingredient',
  timestamps: false,
  underscored: true
});

export default Ingredient;
