import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const AlbumPost = sequelize.define('AlbumPost', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  post_id: { type: DataTypes.INTEGER, allowNull: false },
  album: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'album_post',
  timestamps: false,
  underscored: true
});

export default AlbumPost;
