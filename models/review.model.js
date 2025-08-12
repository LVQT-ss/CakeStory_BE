import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'review',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['order_id', 'user_id']
    },
    {
      fields: ['order_id']
    },
    {
      fields: ['user_id']
    }
  ]
});

export default Review;
