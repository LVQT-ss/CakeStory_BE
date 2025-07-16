import ShopMember from '../models/shop_member.model.js';
import BakerProfile from '../models/shop.model.js';
import User from '../models/User.model.js';

// 1. Tạo shop member mới (chỉ chủ shop được tạo)
export const createShopMember = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { newUserId } = req.body;

    const shop = await BakerProfile.findOne({ where: { user_id: currentUserId } });
    if (!shop) return res.status(403).json({ message: 'You do not own a shop' });

    const existing = await ShopMember.findOne({
      where: { shop_id: shop.shop_id, user_id: newUserId }
    });
    if (existing) return res.status(400).json({ message: 'This user is already a shop member' });

    const newMember = await ShopMember.create({
      shop_id: shop.shop_id,
      user_id: newUserId,
      is_admin: false,
      is_active: false
    });

    return res.status(201).json({ message: 'Shop member created', member: newMember });
  } catch (error) {
    console.error('Error creating shop member:', error);
    return res.status(500).json({ message: 'Error creating shop member', error: error.message });
  }
};


