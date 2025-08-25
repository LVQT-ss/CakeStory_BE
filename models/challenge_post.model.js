import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';
import Post from './post.model.js';
import Challenge from './challenge.model.js';
import User from './user.model.js';

const ChallengePost = sequelize.define('ChallengePost', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  post_id: { 
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'post', key: 'id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },

  challenge_id: { 
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'challenge', key: 'id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },

  user_id: { 
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'user', key: 'id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },

  challengeName: { type: DataTypes.STRING(100) },

  is_challenge: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_design: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },

  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  deleted_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'challenge_post',
  timestamps: false,
  underscored: true,
  paranoid: true,
  deletedAt: 'deleted_at'
});

export default ChallengePost;
