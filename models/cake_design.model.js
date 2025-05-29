import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const CakeDesign = sequelize.define('CakeDesign', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  shop_id: { type: DataTypes.INTEGER, allowNull: false },
  design_name: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT },
  design_data: { type: DataTypes.TEXT, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  is_public: { type: DataTypes.BOOLEAN, defaultValue: true },
  is_ai_generated: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'cake_design',
  timestamps: false,
  underscored: true
});

export default CakeDesign;
