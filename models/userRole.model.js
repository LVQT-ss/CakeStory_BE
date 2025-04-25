import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';
import User from './user.model.js';
import Role from './role.model.js';

const UserRole = sequelize.define('UserRole', {
    userRoleId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'userId'
        }
    },
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Role,
            key: 'roleId'
        }
    },
    assignedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    assignedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: User,
            key: 'userId'
        }
    },
    // expiresAt: {
    //     type: DataTypes.DATE,
    //     allowNull: true,
    //     comment: 'Optional expiration date for temporary role assignments'
    // }
}, {
    tableName: 'user_roles',
    timestamps: false,
    indexes: [
        // Tạo unique index để đảm bảo mỗi user chỉ có một lần assignment cho mỗi role
        {
            unique: true,
            fields: ['userId', 'roleId']
        }
    ]
});

export default UserRole;