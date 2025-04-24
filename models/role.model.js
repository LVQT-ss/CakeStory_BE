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
    },
    permissions: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'JSON object containing specific permissions for this role'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
}, {
    tableName: 'roles',
    timestamps: false,
});

export default Role;