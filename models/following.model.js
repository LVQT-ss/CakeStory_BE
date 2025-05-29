import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const Following = sequelize.define('Following', {
  follower_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  followed_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'following',
  timestamps: false,
  underscored: true
});

export default Following;
