import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const ChallengeEntry = sequelize.define('ChallengeEntry', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  challenge_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  post_count: { type: DataTypes.INTEGER },
  user_count: { type: DataTypes.INTEGER }
}, {
  tableName: 'challenge_entry',
  timestamps: false,
  underscored: true
});

export default ChallengeEntry;
