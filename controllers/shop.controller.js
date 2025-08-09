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

export const getShopOrderStats = async (req, res) => {
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

        // Get order statistics
        const totalOrders = await CakeOrder.count({
            where: {
                shop_id: shopId,
                status: {
                    [Op.notIn]: ['cancelled']
                }
            }
        });

        const completedOrders = await CakeOrder.count({
            where: {
                shop_id: shopId,
                status: 'completed'
            }
        });

        const pendingOrders = await CakeOrder.count({
            where: {
                shop_id: shopId,
                status: 'pending'
            }
        });

        const orderedOrders = await CakeOrder.count({
            where: {
                shop_id: shopId,
                status: 'ordered'
            }
        });

        const shippedOrders = await CakeOrder.count({
            where: {
                shop_id: shopId,
                status: 'shipped'
            }
        });

        const cancelledOrders = await CakeOrder.count({
            where: {
                shop_id: shopId,
                status: 'cancelled'
            }
        });

        const complainingOrders = await CakeOrder.count({
            where: {
                shop_id: shopId,
                status: 'complaining'
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Shop order statistics retrieved successfully',
            data: {
                shop_id: parseInt(shopId),
                shop_name: shop.business_name,
                order_statistics: {
                    total_orders: totalOrders,
                    completed_orders: completedOrders,
                    pending_orders: pendingOrders,
                    ordered_orders: orderedOrders,
                    shipped_orders: shippedOrders,
                    cancelled_orders: cancelledOrders,
                    complaining_orders: complainingOrders
                },
                completion_rate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(2) : 0
            }
        });

    } catch (error) {
        console.error('Error retrieving shop order statistics:', error);
        return res.status(500).json({
            success: false,
            message: 'Error retrieving shop order statistics',
            error: error.message
        });
    }
};

export const getShopRevenue = async (req, res) => {
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

        // Get order statistics with financial data
        const orderStats = await CakeOrder.findAll({
            where: { shop_id: shopId },
            attributes: ['id', 'status', 'total_price']
        });

        // Initialize financial statistics for each status
        const financialStats = {
            pending_money: 0,
            ordered_money: 0,
            shipped_money: 0,
            completed_money: 0,
            cancelled_money: 0,
            complaining_money: 0
        };

        // Process each order and categorize by status
        orderStats.forEach(order => {
            const orderAmount = parseFloat(order.total_price) || 0;

            // Categorize money by exact order status
            switch (order.status) {
                case 'pending':
                    financialStats.pending_money += orderAmount;
                    break;
                case 'ordered':
                    financialStats.ordered_money += orderAmount;
                    break;
                case 'shipped':
                    financialStats.shipped_money += orderAmount;
                    break;
                case 'completed':
                    financialStats.completed_money += orderAmount;
                    break;
                case 'cancelled':
                    financialStats.cancelled_money += orderAmount;
                    break;
                case 'complaining':
                    financialStats.complaining_money += orderAmount;
                    break;
            }
        });

        // Calculate totals
        const totalMoney = Object.values(financialStats).reduce((sum, amount) => sum + amount, 0);
        const activeMoney = financialStats.pending_money + financialStats.ordered_money +
            financialStats.shipped_money + financialStats.complaining_money;

        return res.status(200).json({
            success: true,
            message: 'Shop revenue statistics retrieved successfully',
            data: {
                shop_id: parseInt(shopId),
                shop_name: shop.business_name,
                financial_summary: {
                    ordered_money: financialStats.ordered_money.toFixed(2),
                    completed_money: financialStats.completed_money.toFixed(2),
                    cancelled_money: financialStats.cancelled_money.toFixed(2),
                    complaining_money: financialStats.complaining_money.toFixed(2)
                }
            }
        });

    } catch (error) {
        console.error('Error retrieving shop revenue statistics:', error);
        return res.status(500).json({
            success: false,
            message: 'Error retrieving shop revenue statistics',
            error: error.message
        });
    }
};

export const getShopRevenueThisMonth = async (req, res) => {
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

        // Get current month's start and end dates
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // Get order statistics with financial data for current month only
        const orderStats = await CakeOrder.findAll({
            where: {
                shop_id: shopId,
                created_at: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            },
            attributes: ['id', 'status', 'total_price', 'created_at']
        });

        // Initialize financial statistics for each status
        const financialStats = {
            pending_money: 0,
            ordered_money: 0,
            shipped_money: 0,
            completed_money: 0,
            cancelled_money: 0,
            complaining_money: 0
        };

        // Process each order and categorize by status
        orderStats.forEach(order => {
            const orderAmount = parseFloat(order.total_price) || 0;

            // Categorize money by exact order status
            switch (order.status) {
                case 'pending':
                    financialStats.pending_money += orderAmount;
                    break;
                case 'ordered':
                    financialStats.ordered_money += orderAmount;
                    break;
                case 'shipped':
                    financialStats.shipped_money += orderAmount;
                    break;
                case 'completed':
                    financialStats.completed_money += orderAmount;
                    break;
                case 'cancelled':
                    financialStats.cancelled_money += orderAmount;
                    break;
                case 'complaining':
                    financialStats.complaining_money += orderAmount;
                    break;
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Shop revenue statistics for this month retrieved successfully',
            data: {
                shop_id: parseInt(shopId),
                shop_name: shop.business_name,
                month_info: {
                    current_month: now.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
                    start_date: startOfMonth.toISOString().split('T')[0],
                    end_date: endOfMonth.toISOString().split('T')[0]
                },
                financial_summary: {
                    ordered_money: financialStats.ordered_money.toFixed(2),
                    completed_money: financialStats.completed_money.toFixed(2),
                    cancelled_money: financialStats.cancelled_money.toFixed(2),
                    complaining_money: financialStats.complaining_money.toFixed(2)
                }
            }
        });

    } catch (error) {
        console.error('Error retrieving shop revenue statistics for this month:', error);
        return res.status(500).json({
            success: false,
            message: 'Error retrieving shop revenue statistics for this month',
            error: error.message
        });
    }
};