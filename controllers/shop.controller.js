import sequelize from '../database/db.js';
import BakerProfile from '../models/shop.model.js';
import User from '../models/User.model.js';
import ShopMember from '../models/shop_member.model.js';
import { Op } from 'sequelize';

// Tạo shop mới (1 user chỉ được 1 shop)
export const createShop = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            business_name, business_address, phone_number,
            specialty, bio, is_active, longtitue, latitude
        } = req.body;
        
        const user_id = req.userId;

        const existing = await BakerProfile.findOne({ where: { user_id } });
        if (existing) {
            return res.status(400).json({ message: 'Shop already exists for this user' });
        }

        // Tạo shop mới
        const createdShop = await BakerProfile.create({
            user_id,
            business_name,
            business_address,
            phone_number,
            specialty,
            bio,
            is_active,
            longitude: longtitue, // fix typo nếu cần
            latitude
        }, { transaction });

        // Tạo shop member (chủ shop)
        await ShopMember.create({
            shop_id: createdShop.shop_id,
            user_id,
            is_admin: true,
            is_active: true,
            joined_at: new Date()
        }, { transaction });

        await transaction.commit();

        return res.status(201).json({
            message: 'Shop and shop member created successfully.',
            shop: createdShop
        });
    } catch (error) {
        if (!transaction.finished) await transaction.rollback();
        console.error('Error creating shop:', error);
        return res.status(500).json({ message: 'Error creating shop', error: error.message });
    }
};

// Lấy tất cả shop đang hoạt động
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

// Lấy shop theo tên
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

// Lấy shop theo userId
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

// Cập nhật thông tin shop
export const updateShop = async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;

        const shop = await BakerProfile.findOne({ where: { user_id: userId } });
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        await shop.update(updates);
        return res.status(200).json({ message: 'Shop updated successfully', shop });
    } catch (error) {
        console.error('Error updating shop:', error);
        return res.status(500).json({ message: 'Error updating shop', error: error.message });
    }
};

// "Xóa" shop bằng cách đặt is_active = false
export const deleteShop = async (req, res) => {
    try {
        const { userId } = req.params;

        const shop = await BakerProfile.findOne({ where: { user_id: userId, is_active: true } });
        if (!shop) {
            return res.status(404).json({ message: 'Active shop not found' });
        }

        shop.is_active = false;
        await shop.save();

        return res.status(200).json({
            message: 'Shop deactivated successfully',
            shop: {
                user_id: shop.user_id,
                business_name: shop.business_name,
                is_active: shop.is_active
            }
        });
    } catch (error) {
        console.error('Error deactivating shop:', error);
        return res.status(500).json({ message: 'Error deactivating shop', error: error.message });
    }
};

// Lấy tất cả shop, bao gồm cả shop đã bị vô hiệu hóa (is_active = false)
export const getAllShopsInactive = async (req, res) => {
    try {
        const shops = await BakerProfile.findAll({
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email']
            }]
        });

        return res.status(200).json({ message: 'All shops retrieved successfully', shops });
    } catch (error) {
        console.error('Error retrieving all shops (including inactive):', error);
        return res.status(500).json({ message: 'Error retrieving all shops', error: error.message });
    }
};
