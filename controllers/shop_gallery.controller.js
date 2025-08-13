import ShopGallery from '../models/shop_gallery.model.js';
import Shop from '../models/shop.model.js';

// Create multiple gallery items for a shop
export const createShopGallery = async (req, res) => {
    try {
        const { shop_id, title, images } = req.body; 

        if (!Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ message: 'Images must be a non-empty array' });
        }

        // Kiểm tra shop có tồn tại không
        const shop = await Shop.findByPk(shop_id);
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        // Tạo mảng dữ liệu để insert
        const galleryItemsData = images.map(img => ({
            shop_id,
            title: title || null,
            image: img
        }));

        const galleryItems = await ShopGallery.bulkCreate(galleryItemsData);

        return res.status(201).json({
            message: 'Shop gallery items created successfully',
            galleryItems
        });
    } catch (error) {
        console.error('Error creating shop gallery items:', error);
        return res.status(500).json({ message: 'Error creating shop gallery items', error: error.message });
    }
};


// Get all gallery items of a shop
export const getShopGalleryByShopId = async (req, res) => {
    try {
        const { shop_id } = req.params;

        const shop = await Shop.findByPk(shop_id);
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        const gallery = await ShopGallery.findAll({
            where: { shop_id: shop_id }
        });

        return res.status(200).json({
            message: 'Shop gallery retrieved successfully',
            shop_id: parseInt(shop_id),
            gallery
        });
    } catch (error) {
        console.error('Error retrieving shop gallery:', error);
        return res.status(500).json({ message: 'Error retrieving shop gallery', error: error.message });
    }
};

// Get single gallery item by ID
export const getShopGalleryById = async (req, res) => {
    try {
        const { id } = req.params;

        const galleryItem = await ShopGallery.findByPk(id);
        if (!galleryItem) {
            return res.status(404).json({ message: 'Shop gallery item not found' });
        }

        return res.status(200).json({
            message: 'Shop gallery item retrieved successfully',
            galleryItem
        });
    } catch (error) {
        console.error('Error retrieving shop gallery item:', error);
        return res.status(500).json({ message: 'Error retrieving shop gallery item', error: error.message });
    }
};

// Update gallery item
export const updateShopGallery = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const galleryItem = await ShopGallery.findByPk(id);
        if (!galleryItem) {
            return res.status(404).json({ message: 'Shop gallery item not found' });
        }

        await galleryItem.update(updates);

        return res.status(200).json({
            message: 'Shop gallery item updated successfully',
            galleryItem
        });
    } catch (error) {
        console.error('Error updating shop gallery item:', error);
        return res.status(500).json({ message: 'Error updating shop gallery item', error: error.message });
    }
};

// Delete gallery item
export const deleteShopGallery = async (req, res) => {
    try {
        const { id } = req.params;

        const galleryItem = await ShopGallery.findByPk(id);
        if (!galleryItem) {
            return res.status(404).json({ message: 'Shop gallery item not found' });
        }

        await galleryItem.destroy();

        return res.status(200).json({
            message: 'Shop gallery item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting shop gallery item:', error);
        return res.status(500).json({ message: 'Error deleting shop gallery item', error: error.message });
    }
};

// Get all gallery items (admin hoặc public)
export const getAllShopGallery = async (req, res) => {
    try {
        const galleries = await ShopGallery.findAll({
            include: {
                model: Shop,
                as: 'shop',
                attributes: ['shop_id', 'business_name']
            }
        });

        return res.status(200).json({
            message: 'All shop galleries retrieved successfully',
            total: galleries.length,
            galleries
        });
    } catch (error) {
        console.error('Error retrieving all shop galleries:', error);
        return res.status(500).json({ message: 'Error retrieving all shop galleries', error: error.message });
    }
};