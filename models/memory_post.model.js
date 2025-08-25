import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';
import User from './User.model.js';

const MemoryPost = sequelize.define('MemoryPost', {
  post_id: { type: DataTypes.INTEGER, primaryKey: true },
  event_date: { type: DataTypes.DATE },
  event_type: { type: DataTypes.STRING(100) },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  }
}, {
  tableName: 'memory_post',
  timestamps: false,
  underscored: true
});

export default MemoryPost;
