import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const Subscription = sequelize.define('Subscription', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Transaction_id: { type: DataTypes.INTEGER, allowNull: false },
  totalPostUp: { type: DataTypes.INTEGER },
  ai_credits: { type: DataTypes.INTEGER, defaultValue: 1 },
  create_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'subscription',
  timestamps: false,
  underscored: true
});

export default Subscription;
