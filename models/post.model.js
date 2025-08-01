import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const Post = sequelize.define('Post', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT },
  post_type: {
    type: DataTypes.ENUM('memory', 'marketplace', 'group', 'challenge', 'album'),
    allowNull: false
  },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  is_public: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'post',
  timestamps: false,
  underscored: true
});

export default Post;
