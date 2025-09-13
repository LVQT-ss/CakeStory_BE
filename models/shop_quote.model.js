import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const ShopQuote = sequelize.define('ShopQuote', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    cake_quote_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'cake_quote',
            key: 'id'
        }
    },
    shop_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'shop',
            key: 'shop_id'
        }
    },
    quoted_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    preparation_time: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'hours needed to prepare'
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "shop's note to customer"
    },
    ingredients_breakdown: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted'),
        allowNull: false,
        defaultValue: 'pending',
    },
    accepted_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'shop_quote',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false, // Only track creation time
});

export default ShopQuote;
