import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';
import Wallet from './wallet.model.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    full_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    phone_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    avatar: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    firebase_uid: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
    },
    role: {
        type: DataTypes.ENUM('user', 'staff', 'admin'),
        allowNull: false,
        defaultValue: 'user',
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    isPremium: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    }
}, {
    tableName: 'user',
    timestamps: true,
    underscored: true,
    // Trong models/User.model.js - ĐÃ CÓ SẴN
    hooks: {
        afterCreate: async (user, options) => {
            try {
                await Wallet.create({
                    user_id: user.id,
                    balance: 0,
                    created_at: new Date(),
                    updated_at: new Date()
                }, { transaction: options.transaction });
                console.log(`✅ Wallet created for user ${user.id} with balance 0`);
            } catch (error) {
                console.error(`❌ Failed to create wallet for user ${user.id}:`, error);
                throw error;
            }
        }
    }
});

export default User;
