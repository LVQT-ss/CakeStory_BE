import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';
import User from "./user.model.js";
const ChallengeEntry = sequelize.define('ChallengeEntry', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  challenge_id: { type: DataTypes.INTEGER, allowNull: false },
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
  tableName: 'challenge_entry',
  timestamps: false,
  underscored: true
});

export default ChallengeEntry;
