import User from './user.model.js';
import Role from './role.model.js';
import UserRole from './userRole.model.js';

function setupAssociations() {
    // User-Role: Nhiều-nhiều thông qua UserRole
    User.belongsToMany(Role, {
        through: UserRole,
        foreignKey: 'userId',
        otherKey: 'roleId',
        as: 'roles'
    });

    Role.belongsToMany(User, {
        through: UserRole,
        foreignKey: 'roleId',
        otherKey: 'userId',
        as: 'users'
    });

    // UserRole quan hệ một-nhiều với User (người được gán quyền)
    UserRole.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });

    // UserRole quan hệ một-nhiều với Role
    UserRole.belongsTo(Role, {
        foreignKey: 'roleId',
        as: 'role'
    });

    // UserRole quan hệ một-nhiều với User (người gán quyền)
    UserRole.belongsTo(User, {
        foreignKey: 'assignedBy',
        as: 'assigner'
    });
}

export default setupAssociations;