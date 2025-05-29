import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const CakeDesignDetail = sequelize.define('CakeDesignDetail', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cake_design_id: { type: DataTypes.INTEGER, allowNull: false },
  frosting: {
    type: DataTypes.ENUM('Vanilla', 'Chocolate', 'Lemon', 'Matcha', 'Strawberry'),
    allowNull: false
  },
  frosting_style: {
    type: DataTypes.ENUM('Full cover', 'Drip'),
    allowNull: false
  },
  size: { type: DataTypes.INTEGER },
  cake_flavor: {
    type: DataTypes.ENUM('Vanilla', 'Chocolate', 'Lemon', 'Matcha', 'Strawberry'),
    allowNull: false
  },
  toppings: {
    type: DataTypes.ENUM('Strawberry', 'Cherry', 'Chocolate', 'Whipped cream'),
    allowNull: false
  },
  decorations: {
    type: DataTypes.ENUM('Sprinkles', 'Flowers', 'Candies'),
    allowNull: false
  },
  shape: {
    type: DataTypes.ENUM('Round', 'Square', 'Rectangle', 'Heart'),
    allowNull: false
  },
  tiers: { type: DataTypes.INTEGER }
}, {
  tableName: 'cake_design_detail',
  timestamps: false,
  underscored: true
});

export default CakeDesignDetail;
