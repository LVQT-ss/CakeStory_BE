import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const ShopMember = sequelize.define('shop_member', {
  shop_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'shop',
      key: 'shop_id'
    },
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user',
      key: 'id'
    },
    primaryKey: true
  },
  is_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  joined_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'shop_member',
  timestamps: false,
  underscored: true
});

export default ShopMember;
