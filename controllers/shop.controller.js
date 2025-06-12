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


