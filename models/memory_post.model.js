import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const MemoryPost = sequelize.define('MemoryPost', {
  post_id: { type: DataTypes.INTEGER, primaryKey: true },
  album_id: { type: DataTypes.INTEGER },
  event_date: { type: DataTypes.DATE },
  event_type: { type: DataTypes.STRING(100) },
  user_id: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'memory_post',
  timestamps: false,
  underscored: true
});

export default MemoryPost;
