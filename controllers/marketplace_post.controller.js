import sequelize from '../database/db.js';
import MarketplacePost from '../models/marketplace_post.model.js';
import Post from '../models/post.model.js';
import BakerProfile from '../models/shop.model.js';
import User from '../models/User.model.js';
import PostData from '../models/post_data.model.js';
import CakeSize from '../models/cake_size.model.js';

// Tạo marketplace post
export const createMarketplacePost = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            title, description,
            available = true, expiry_date,
            is_public = true, media, cakeSizes,
            tier
        } = req.body;

        const user_id = req.userId;

        if (!title) throw new Error('Title is required');
        if (!Array.isArray(cakeSizes) || cakeSizes.length === 0) {
            throw new Error('At least one cake size is required');
        }

        const userShop = await BakerProfile.findOne({
            where: { user_id, is_active: true }
        });

        if (!userShop) throw new Error('You must have an active shop to create marketplace posts');

        const post = await Post.create({
            title,
            description: description || null,
            post_type: 'marketplace',
            is_public,
            created_at: new Date(),
            user_id
        }, { transaction });

        const marketplacePost = await MarketplacePost.create({
            post_id: post.id,
            shop_id: userShop.shop_id,
            user_id,
            available,
            expiry_date: expiry_date ? new Date(expiry_date) : null,
            tier,
            created_at: new Date()
        }, { transaction });

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

        const cakeSizePromises = cakeSizes.map(sizeItem => {
            if (sizeItem.size && sizeItem.price) {
                return CakeSize.create({
                    marketplace_post_id: marketplacePost.post_id,
                    size: sizeItem.size,
                    price: parseFloat(sizeItem.price)
                }, { transaction });
            }
            throw new Error('Each cake size must have size and price');
        });
        await Promise.all(cakeSizePromises);

        await transaction.commit();

        const createdPost = await Post.findByPk(post.id, {
            include: [
                {
                    model: MarketplacePost,
                    as: 'marketplacePost',
                    attributes: ['shop_id', 'user_id', 'available', 'expiry_date','tier', 'created_at'],
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
                        },
                        {
                            model: CakeSize,
                            as: 'cakeSizes'
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
        if (!transaction.finished) await transaction.rollback();
        console.error('Error creating marketplace post:', error);
        return res.status(500).json({ message: 'Error creating marketplace post', error: error.message });
    }
};

// Lấy tất cả marketplace posts
export const getAllMarketplacePosts = async (req, res) => {
    try {
        const posts = await MarketplacePost.findAll({
            include: [
                {
                    model: Post,
                    as: 'post',
                    attributes: ['id', 'title', 'description', 'is_public', 'created_at'],
                    include: [{ model: PostData, as: 'media' }]
                },
                {
                    model: BakerProfile,
                    as: 'shop',
                    attributes: ['shop_id', 'business_name'],
                    include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }]
                },
                {
                    model: CakeSize,
                    as: 'cakeSizes'
                }
            ]
        });
        return res.status(200).json({ message: 'Marketplace posts retrieved', posts });
    } catch (error) {
        console.error('Error retrieving marketplace posts:', error);
        return res.status(500).json({ message: 'Error retrieving marketplace posts', error: error.message });
    }
};

// Lấy marketplace post theo ID
export const getMarketplacePostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await MarketplacePost.findByPk(id, {
            include: [
                {
                    model: Post,
                    as: 'post',
                    include: [{ model: PostData, as: 'media' }]
                },
                {
                    model: BakerProfile,
                    as: 'shop',
                    include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }]
                },
                {
                    model: CakeSize,
                    as: 'cakeSizes'
                }
            ]
        });

        if (!post) return res.status(404).json({ message: 'Marketplace post not found' });

        return res.status(200).json({ message: 'Marketplace post retrieved', post });
    } catch (error) {
        console.error('Error retrieving marketplace post:', error);
        return res.status(500).json({ message: 'Error retrieving marketplace post', error: error.message });
    }
};

// Cập nhật marketplace post
export const updateMarketplacePost = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const {
            title, description, is_public,
            available, expiry_date,tier
        } = req.body;

        const marketplacePost = await MarketplacePost.findByPk(id, {
            include: [{ model: Post, as: 'post' }],
            transaction
        });

        if (!marketplacePost) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Marketplace post not found' });
        }

        await marketplacePost.update({
            available,
            expiry_date: expiry_date ? new Date(expiry_date) : null,
            tier
        }, { transaction });

        if (marketplacePost.post) {
            await marketplacePost.post.update({
                title,
                description,
                is_public
            }, { transaction });
        }

        await transaction.commit();

        return res.status(200).json({
            message: 'Marketplace post and post updated successfully',
            post: marketplacePost
        });
    } catch (error) {
        if (!transaction.finished) await transaction.rollback();
        console.error('Error updating marketplace post and post:', error);
        return res.status(500).json({
            message: 'Error updating marketplace post and post',
            error: error.message
        });
    }
};

// Xóa marketplace post
export const deleteMarketplacePost = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await MarketplacePost.findByPk(id);
        if (!post) return res.status(404).json({ message: 'Marketplace post not found' });

        await post.destroy();
        return res.status(200).json({ message: 'Marketplace post deleted' });
    } catch (error) {
        console.error('Error deleting marketplace post:', error);
        return res.status(500).json({ message: 'Error deleting marketplace post', error: error.message });
    }
};
