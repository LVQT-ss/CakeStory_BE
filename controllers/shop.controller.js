import sequelize from '../database/db.js';
import BakerProfile from '../models/shop.model.js';
import User from '../models/User.model.js';
import { Op } from 'sequelize';
import Post from '../models/post.model.js';
import MarketplacePost from '../models/marketplace_post.model.js';
import PostData from '../models/post_data.model.js';

// Tạo shop mới (1 user chỉ được 1 shop)
export const createShop = async (req, res) => {
    try {
        const {
            user_id, business_name, business_address, phone_number,
            specialty, bio, is_active, longtitue, latitude
        } = req.body;

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
            longitude: longtitue, // fix typo nếu cần
            latitude
        });

        return res.status(201).json({ message: 'Shop created successfully', shop: createdShop });
    } catch (error) {
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

// Tạo marketplace post
export const createMarketplacePost = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            title,
            description,
            price,
            available = true,
            expiry_date,
            is_public = true,
            media
        } = req.body;

        const user_id = req.userId;

        // Validate
        if (!title) {
            throw new Error('Title is required');
        }

        if (!price || price <= 0) {
            throw new Error('Valid price is required');
        }

        // Kiểm tra shop đang hoạt động
        const userShop = await BakerProfile.findOne({
            where: { user_id, is_active: true }
        });

        if (!userShop) {
            throw new Error('You must have an active shop to create marketplace posts');
        }

        // Tạo post chung
        const post = await Post.create({
            title,
            description: description || null,
            post_type: 'marketplace',
            is_public,
            created_at: new Date()
        }, { transaction });

        // Tạo marketplace post cụ thể
        await MarketplacePost.create({
            post_id: post.id,
            shop_id: userShop.shop_id,
            user_id,
            price: parseInt(price),
            available,
            expiry_date: expiry_date ? new Date(expiry_date) : null,
            created_at: new Date()
        }, { transaction });

        // Nếu có media
        if (Array.isArray(media) && media.length > 0) {
            const mediaPromises = media.map(item => {
                if (item.image_url || item.video_url) {
                    return PostData.create({
                        post_id: post.id,
                        image_url: item.image_url || null,
                        video_url: item.video_url || null
                    }, { transaction });
                }
                return null;
            }).filter(Boolean);

            await Promise.all(mediaPromises);
        }

        await transaction.commit();

        // Trả về post đã tạo (kèm theo liên kết shop/user/media)
        const createdPost = await Post.findByPk(post.id, {
            include: [
                {
                    model: MarketplacePost,
                    as: 'marketplacePost', // 🔥 CẦN THÊM alias này
                    attributes: ['shop_id', 'user_id', 'price', 'available', 'expiry_date', 'created_at'],
                    include: [
                        {
                            model: BakerProfile,
                            as: 'shop',
                            attributes: ['business_name', 'business_address', 'phone_number'],
                            include: [{
                                model: User,
                                as: 'user',
                                attributes: ['id', 'username', 'email']
                            }]
                        }
                    ]
                },
                {
                    model: PostData,
                    as: 'media',
                    attributes: ['id', 'image_url', 'video_url']
                }
            ]
        });

        return res.status(201).json({
            message: 'Marketplace post created successfully',
            post: createdPost
        });

    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }

        console.error('Error creating marketplace post:', error);
        return res.status(500).json({
            message: 'Error creating marketplace post',
            error: error.message
        });
    }
};
