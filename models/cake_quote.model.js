import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const CakeQuote = sequelize.define('CakeQuote', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'user',
            key: 'id'
        }
    },
    accepted_Shop: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'shop',
            key: 'shop_id'
        }
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    imageDesign: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'URL to design image'
    },
    cake_size: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'e.g., "6 inch", "8 inch"'
    },
    special_requirements: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'dietary restrictions, themes, etc.'
    },
    budget_range: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('open', 'closed', 'expired'),
        allowNull: false,
        defaultValue: 'open',
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'when quote request expires'
    },
}, {
    tableName: 'cake_quote',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false, // Only track creation time
});

export default CakeQuote;
