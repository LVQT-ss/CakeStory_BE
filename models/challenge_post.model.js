import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const ChallengePost = sequelize.define('ChallengePost', {
  id: { type: DataTypes.INTEGER },
  post_id: { type: DataTypes.INTEGER, primaryKey: true },
  challenge_id: { type: DataTypes.INTEGER },
  challengeName: { type: DataTypes.STRING(100) },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
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