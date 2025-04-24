import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';


const User = sequelize.define('User', {
    userId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true, // Added email validation
        }
    },
    image: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userAddress: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    userPhoneNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    userStatus: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'), // More structured status
        allowNull: true,
        defaultValue: 'active'
    },
}, {
    tableName: 'users', // More conventional naming
    timestamps: false,
});



export default User;