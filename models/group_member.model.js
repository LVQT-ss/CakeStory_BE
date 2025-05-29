import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const GroupMember = sequelize.define('GroupMember', {
  group_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  is_admin: { type: DataTypes.BOOLEAN, defaultValue: false },
  joined_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'group_member',
  timestamps: false,
  underscored: true
});

export default GroupMember;
