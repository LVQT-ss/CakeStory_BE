import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const PostData = sequelize.define('PostData', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  post_id: { type: DataTypes.INTEGER, allowNull: false },
  image_url: { type: DataTypes.STRING(255) },
  video_url: { type: DataTypes.STRING(255) },
  caption: { type: DataTypes.STRING(255) }
}, {
  tableName: 'post_data',
  timestamps: false,
  underscored: true
});

export default PostData;
