import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const GroupPost = sequelize.define('GroupPost', {
  post_id: { type: DataTypes.INTEGER, primaryKey: true },
  group_id: { type: DataTypes.INTEGER, allowNull: false },
  is_pinned: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'group_post',
  timestamps: false,
  underscored: true
});

export default GroupPost;
