// models/shop.model.js
import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const Shop = sequelize.define('shop', {
  shop_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user',
      key: 'id'
    }
  },
  business_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  business_address: DataTypes.TEXT,
  phone_number: DataTypes.STRING(20),
  specialty: DataTypes.STRING(255),
  bio: DataTypes.TEXT,
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  longitude: DataTypes.FLOAT,
  latitude: DataTypes.FLOAT,
  business_hours: DataTypes.TEXT,
  delivery_area: DataTypes.TEXT,
  background_image: DataTypes.STRING(255),
  avatar_image: DataTypes.STRING(255)
}, {
  tableName: 'shop',
  timestamps: false
});

export default Shop;