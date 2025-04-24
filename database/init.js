// src/database/init.js
import sequelize from './db.js';
import User from '../model/user.model.js';
import product from '../model/product.model.js';
import order from '../model/order.model.js';
import orderDetails from '../model/orderDetails.model.js';
import transaction from '../model/transactions.model.js';
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
