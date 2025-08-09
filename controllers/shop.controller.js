// controllers/shop.controller.js
import sequelize from '../database/db.js';
import BakerProfile from '../models/shop.model.js';
import User from '../models/User.model.js';
import ShopMember from '../models/shop_member.model.js';
import CakeOrder from '../models/cake_order.model.js';
import { Op } from 'sequelize';

export const createShop = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            business_name, business_address, phone_number,
            specialty, bio, is_active, longtitue, latitude,
            business_hours, delivery_area, background_image, avatar_image
        } = req.body;

        const user_id = req.userId;

        const existing = await BakerProfile.findOne({ where: { user_id } });
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
            longitude: longtitue,
            latitude,
            business_hours,
            delivery_area,
            background_image,
            avatar_image
        }, { transaction });

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

export const getAllShopsInactive = async (req, res) => {
    try {
        const shops = await BakerProfile.findAll({
            include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }]
        });
        return res.status(200).json({ message: 'All shops retrieved successfully', shops });
    } catch (error) {
        console.error('Error retrieving all shops (including inactive):', error);
        return res.status(500).json({ message: 'Error retrieving all shops', error: error.message });
    }
};

export const getShopTotalCustomers = async (req, res) => {
    try {
        const { shopId } = req.params;

        // First, verify the shop exists
        const shop = await BakerProfile.findByPk(shopId);
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        // Get total unique customers who have ordered from this shop
        // We count distinct customer_ids from cake orders for this shop
        const totalCustomers = await CakeOrder.count({
            where: {
                shop_id: shopId,
                status: {
                    [Op.notIn]: ['cancelled'] // Exclude cancelled orders
                }
            },
            distinct: true,
            col: 'customer_id'
        });

        return res.status(200).json({
            success: true,
            message: 'Shop customer count retrieved successfully',
            data: {
                shop_id: parseInt(shopId),
                shop_name: shop.business_name,
                total_unique_customers: totalCustomers
            }
        });

    } catch (error) {
        console.error('Error retrieving shop customer count:', error);
        return res.status(500).json({
            success: false,
            message: 'Error retrieving shop customer count',
            error: error.message
        });
    }
};

