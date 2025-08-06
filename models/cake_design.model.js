import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const CakeDesign = sequelize.define('CakeDesign', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.TEXT },
  design_image: { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  is_public: { type: DataTypes.BOOLEAN, defaultValue: true },
  ai_generated: { type: DataTypes.STRING }
}, {
  tableName: 'cake_design',
  timestamps: false,
  underscored: true
});

export default CakeDesign;
