import BakerProfile from '../models/shop.model.js';
import User from '../models/User.model.js';
import { Op } from 'sequelize';
// Tạo shop mới (1 user chỉ được 1 shop)
export const createShop = async (req, res) => {
    try {
        const {
            user_id, business_name, business_address, phone_number,
            specialty, bio, is_active, longtitue, latitude
        } = req.body;

        const existing = await BakerProfile.findByPk(user_id);
        if (existing) {
            return res.status(400).json({ message: 'Shop already exists for this user' });
        }

        const createdShop = await BakerProfile.create({
            user_id,
            business_name,
            business_address,
            phone_number,
            specialty,
            bio,
            is_active,
            longtitue,
            latitude
        });

        return res.status(201).json({ message: 'Shop created successfully', shop: createdShop });
    } catch (error) {
        console.error('Error creating shop:', error);
        return res.status(500).json({ message: 'Error creating shop', error: error.message });
    }
};

// Lấy tất cả shop đang hoạt động (is_active = true)
export const getAllShops = async (req, res) => {
    try {
        const shops = await BakerProfile.findAll({
            where: { is_active: true },
            include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }]
        });
        return res.status(200).json({ message: 'Shops retrieved successfully', shops });
    } catch (error) {
        console.error('Error retrieving shops:', error);
        return res.status(500).json({ message: 'Error retrieving shops', error: error.message });
    }
};
export const getShopByName = async (req, res) => {
    try {
        const { name } = req.params;

        const shops = await BakerProfile.findAll({
            where: {
                business_name: { [Op.iLike]: `%${name}%` },
                is_active: true
            },
            include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }]
        });

        if (shops.length === 0) {
            return res.status(404).json({ message: 'No active shops found matching name' });
        }

        return res.status(200).json({ message: 'Shops retrieved by name successfully', shops });
    } catch (error) {
        console.error('Error retrieving shop by name:', error);
        return res.status(500).json({ message: 'Error retrieving shop by name', error: error.message });
    }
};

// Lấy shop theo userId nếu shop đang hoạt động
export const getShopByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const shop = await BakerProfile.findOne({
            where: { user_id: userId, is_active: true },
            include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }]
        });

        if (!shop) {
            return res.status(404).json({ message: 'Active shop not found for this user' });
        }

        return res.status(200).json({ message: 'Shop retrieved successfully', shop });
    } catch (error) {
        console.error('Error retrieving shop:', error);
        return res.status(500).json({ message: 'Error retrieving shop', error: error.message });
    }
};

