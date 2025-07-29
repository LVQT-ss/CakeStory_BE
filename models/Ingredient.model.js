import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const Ingredient = sequelize.define('Ingredient', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  shop_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(255), allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  image: { type: DataTypes.STRING, allowNull: true }, // New field
  description: { type: DataTypes.TEXT, allowNull: true }, // New field
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