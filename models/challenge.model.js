import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const Challenge = sequelize.define('Challenge', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT },
  start_date: { type: DataTypes.DATE, allowNull: false },
  end_date: { type: DataTypes.DATE, allowNull: false },
  winning_challenge_id: { type: DataTypes.INTEGER },
  prize_description: { type: DataTypes.TEXT },
  status: {
    type: DataTypes.ENUM("notStart", "onGoing", "ended", "unAvailable")
  },
  max_participants: { type: DataTypes.INTEGER, allowNull: true },
  min_participants: { type: DataTypes.INTEGER, allowNull: true },
  hashtag: { type: DataTypes.STRING(255), allowNull: true },
  rules: { type: DataTypes.TEXT, allowNull: true },
  requirements: { type: DataTypes.TEXT, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'challenge',
  timestamps: false,
  underscored: true
});

export default Challenge;
