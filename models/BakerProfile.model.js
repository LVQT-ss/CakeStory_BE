import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const BakerProfile = sequelize.define('BakerProfile', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'user',
            key: 'id'
        }
    },
    business_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    business_address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    phone_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    specialty: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    }
}, {
    tableName: 'baker_profile',
    timestamps: false,
    underscored: true,
});



export default BakerProfile; 