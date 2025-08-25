// src/database/init.js
import sequelize from './db.js';
import setupAssociations from '../models/associations.js';
const initDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');

        // Ensure schema exists (public)
        await sequelize.createSchema('public', { logging: false }).catch(() => { });

        // Thiết lập quan hệ trước khi sync
        setupAssociations();

        // Đồng bộ các mô hình với cơ sở dữ liệu
        await sequelize.sync({ alter: true });
        console.log('Database synchronized.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

export default initDB;
