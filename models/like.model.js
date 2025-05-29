import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const Like = sequelize.define('Like', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  post_id: { type: DataTypes.INTEGER },
  design_id: { type: DataTypes.INTEGER },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'like',
  timestamps: false,
  underscored: true
});

export default Like;
