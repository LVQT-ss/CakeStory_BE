import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const Wallet = sequelize.define('Wallet', {
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
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
    }

});
export default Wallet;