import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const PictureForCakeDesign = sequelize.define('PictureForCakeDesign', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.TEXT
    },
    title: {
        type: DataTypes.STRING
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'picture_for_cake_design',
    timestamps: false,
    underscored: true
});

export default PictureForCakeDesign;
