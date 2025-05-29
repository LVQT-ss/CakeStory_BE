import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const ChallengePost = sequelize.define('ChallengePost', {
  id: { type: DataTypes.INTEGER },
  post_id: { type: DataTypes.INTEGER, primaryKey: true },
  challenge_id: { type: DataTypes.INTEGER },
  challengeName: { type: DataTypes.STRING(100) },
  is_challenge: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_design: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'challenge_post',
  timestamps: false,
  underscored: true
});

export default ChallengePost;
