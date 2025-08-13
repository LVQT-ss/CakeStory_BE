import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const ShopGallery = sequelize.define('shop_gallery', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  shop_id: { // Khóa ngoại tới shop
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'shop',
      key: 'shop_id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'shop_gallery',
  timestamps: false
});

export default ShopGallery;
