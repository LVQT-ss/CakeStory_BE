import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const Role = sequelize.define('Role', {
    roleId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    roleName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    tableName: 'roles',
    timestamps: false,
});

export default Role;