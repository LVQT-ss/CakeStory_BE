import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const Ingredient = sequelize.define('Ingredient', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  shop_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(255), allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'ingredient',
  timestamps: false,
  underscored: true
});

export default Ingredient;