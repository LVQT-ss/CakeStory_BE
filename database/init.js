// src/database/init.js
import sequelize from './db.js';
import User from '../models/user.model.js';
import UserRole from '../models/userRole.model.js';
import Role from '../models/role.model.js';
const initDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');

        // Đồng bộ các mô hình với cơ sở dữ liệu
        await sequelize.sync({ alter: true });
        console.log('Database synchronized.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

export default initDB;
