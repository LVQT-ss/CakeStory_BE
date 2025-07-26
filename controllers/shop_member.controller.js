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

// 2. Xem tất cả member trong shop hiện tại
export const getMyShopMembers = async (req, res) => {
  try {
    const currentUserId = req.userId;

    const shop = await BakerProfile.findOne({ where: { user_id: currentUserId } });
    if (!shop) return res.status(403).json({ message: 'You do not own a shop' });

    const members = await ShopMember.findAll({
      where: { shop_id: shop.shop_id },
      include: [{ model: User, attributes: ['id', 'username', 'email', 'avatar'] }]
    });

    return res.status(200).json({ message: 'Shop members retrieved', members });
  } catch (error) {
    console.error('Error retrieving shop members:', error);
    return res.status(500).json({ message: 'Error retrieving shop members', error: error.message });
  }
};

// 3. Xóa shop member (chỉ admin cùng shop, không xóa chính mình)
export const deleteShopMember = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { userIdToRemove } = req.params;

    const admin = await ShopMember.findOne({
      where: { user_id: currentUserId, is_admin: true }
    });

    if (!admin) return res.status(403).json({ message: 'Only shop admins can remove members' });

    if (parseInt(userIdToRemove) === currentUserId) {
      return res.status(400).json({ message: 'You cannot remove yourself' });
    }

    const memberToDelete = await ShopMember.findOne({
      where: { user_id: userIdToRemove, shop_id: admin.shop_id }
    });

    if (!memberToDelete) {
      return res.status(404).json({ message: 'This user is not in your shop' });
    }

    await memberToDelete.destroy();

    return res.status(200).json({ message: 'Shop member removed successfully' });
  } catch (error) {
    console.error('Error deleting shop member:', error);
    return res.status(500).json({ message: 'Error deleting shop member', error: error.message });
  }
};

// 4. Cập nhật is_active (chỉ cho phép nếu current user là thành viên không phải admin)
export const updateShopMember = async (req, res) => {
  try {
    const currentUserId = req.userId;

    // Kiểm tra xem user hiện tại có là thành viên không và không phải admin
    const currentMember = await ShopMember.findOne({ where: { user_id: currentUserId } });

    if (!currentMember) {
      return res.status(403).json({ message: 'You are not a shop member' });
    }

    if (currentMember.is_admin) {
      return res.status(403).json({ message: 'Admins cannot perform this update' });
    }

    if (currentMember.is_active) {
      return res.status(400).json({ message: 'Your account is already active' });
    }

    currentMember.is_active = true;
    await currentMember.save();

    return res.status(200).json({ message: 'Account activated successfully', member: currentMember });
  } catch (error) {
    console.error('Error updating shop member:', error);
    return res.status(500).json({ message: 'Error updating shop member', error: error.message });
  }
};
