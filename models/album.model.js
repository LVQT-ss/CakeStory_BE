import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const Album = sequelize.define('Album', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'album',
  timestamps: false,
  underscored: true
});

export default Album;
