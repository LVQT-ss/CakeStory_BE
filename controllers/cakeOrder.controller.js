import sequelize from '../database/db.js';
import CakeOrder from '../models/cake_order.model.js';
import OrderDetail from '../models/order_detail.model.js';
import Ingredient from '../models/Ingredient.model.js';
import Wallet from '../models/wallet.model.js';
import Transaction from '../models/transaction.model.js';
import Shop from '../models/shop.model.js';
import { Op } from 'sequelize';
import User from '../models/User.model.js';
import { verifyToken } from '../middleware/verifyUser.js';
// CREATE CakeOrder with multiple OrderDetails and Payment Processing
export const createCakeOrder = async (req, res) => {
  const {
    shop_id,
    marketplace_post_id,
    base_price,
    size,
    special_instructions,
    tier,
    order_details = []
  } = req.body;
  const customer_id = req.user.id;
  const dbTransaction = await sequelize.transaction();

  try {
    let ingredient_total = 0;

    if (Array.isArray(order_details) && order_details.length > 0) {
      // Tính tổng giá nguyên liệu
      for (const item of order_details) {
        const ingredient = await Ingredient.findByPk(item.ingredient_id);
        if (!ingredient) throw new Error(`Ingredient ID ${item.ingredient_id} not found`);
        ingredient_total += parseFloat(ingredient.price) * item.quantity;
      }
    }

    const total_price = parseFloat(base_price) + ingredient_total;

    // 1. Kiểm tra ví của user có đủ tiền không
    const customerWallet = await Wallet.findOne({
      where: { user_id: customer_id },
      transaction: dbTransaction
    });

    if (!customerWallet) {
      await dbTransaction.rollback();
      return res.status(404).json({
        message: 'Customer wallet not found. Please create a wallet first.'
      });
    }

    const currentBalance = parseFloat(customerWallet.balance);
    if (currentBalance < total_price) {
      await dbTransaction.rollback();
      return res.status(400).json({
        message: `Insufficient balance. Current balance: ${currentBalance} VND, Required: ${total_price} VND`
      });
    }

    // 2. Tìm shop owner và wallet để lưu to_wallet_id
    const shop = await Shop.findByPk(shop_id, { transaction: dbTransaction });
    if (!shop) {
      await dbTransaction.rollback();
      return res.status(404).json({
        message: 'Shop not found'
      });
    }

    const shopWallet = await Wallet.findOne({
      where: { user_id: shop.user_id },
      transaction: dbTransaction
    });

    if (!shopWallet) {
      await dbTransaction.rollback();
      return res.status(404).json({
        message: 'Shop wallet not found. Please create a wallet for shop owner first.'
      });
    }

    // 3. Tạo đơn hàng
    const newOrder = await CakeOrder.create({
      customer_id,
      shop_id,
      marketplace_post_id,
      base_price,
      size,
      ingredient_total,
      total_price,
      status: 'pending',
      special_instructions,
      tier
    }, { transaction: dbTransaction });

    // 4. Tạo OrderDetail nếu có
    if (Array.isArray(order_details) && order_details.length > 0) {
      for (const item of order_details) {
        const ingredient = await Ingredient.findByPk(item.ingredient_id);
        await OrderDetail.create({
          order_id: newOrder.id,
          ingredient_id: item.ingredient_id,
          quantity: item.quantity,
          total_price: (parseFloat(ingredient.price) * item.quantity).toFixed(2)
        }, { transaction: dbTransaction });
      }
    }

    // 5. Trừ tiền từ ví customer
    const newBalance = currentBalance - total_price;
    await Wallet.update(
      {
        balance: newBalance,
        updated_at: new Date()
      },
      {
        where: { user_id: customer_id },
        transaction: dbTransaction
      }
    );

    // 6. Tạo transaction record để tracking (PENDING để giữ tiền)
    const paymentTransaction = await Transaction.create({
      from_wallet_id: customerWallet.id,
      to_wallet_id: shopWallet.id, // Lưu shop wallet ngay từ đầu
      order_id: newOrder.id,
      amount: total_price,
      transaction_type: 'order_payment',
      status: 'pending', // PENDING để giữ tiền cho đến khi order completed
      description: `Payment for cake order #${newOrder.id} (held in escrow)`
    }, { transaction: dbTransaction });

    await dbTransaction.commit();

    res.status(201).json({
      message: 'Cake order created and payment processed successfully',
      order: newOrder,
      payment: {
        transaction_id: paymentTransaction.id,
        amount_paid: total_price,
        previous_balance: currentBalance,
        new_balance: newBalance,
        shop_wallet_id: shopWallet.id,
        status: 'held_in_escrow'
      }
    });

  } catch (error) {
    await dbTransaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Failed to create order and process payment', error: error.message });
  }
};

// GET all CakeOrders (excluding cancelled)
export const getAllCakeOrders = async (req, res) => {
  try {
    const orders = await CakeOrder.findAll({
      include: [
        {
          model: OrderDetail,
          as: 'orderDetails'
        },
        {
          model: User,
          attributes: ['id', 'username', 'full_name', 'email', 'address', 'phone_number']
        },
        {
          model: Shop,
          attributes: ['shop_id', 'business_name', 'phone_number', 'business_address']
        },
      ]
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve orders', error: error.message });
  }
};

// GET CakeOrders by User ID 
export const getCakeOrdersByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Nếu không phải admin/staff → chỉ được lấy order của chính mình
    if (req.role !== 'admin' && req.role !== 'staff') {
      if (parseInt(user_id, 10) !== req.userId) {
        return res.status(403).json({ message: 'Not authorized to view other users orders' });
      }
    }

    const orders = await CakeOrder.findAll({
      where: {
        customer_id: user_id,
      },
      include: [
        {
          model: OrderDetail,
          as: 'orderDetails'
        },
        {
          model: User,
          attributes: [
            'id',
            'username',
            'full_name',
            'email',
            'address',
            'phone_number'
          ]
        },
        {
          model: Shop,
          attributes: [
            'shop_id',
            'business_name',
            'phone_number',
            'business_address'
          ]
        },
      ]
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve orders',
      error: error.message
    });
  }
};


// GET CakeOrder by ID 
export const getCakeOrderById = async (req, res) => {
  try {
    const order = await CakeOrder.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: OrderDetail,
          as: 'orderDetails'
        },
        {
          model: User,
          attributes: ['id', 'username', 'full_name', 'email', 'address', 'phone_number']
        },
        {
          model: Shop,
          attributes: ['shop_id', 'business_name', 'phone_number', 'business_address']
        },
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // ✅ Chỉ cho phép user thường xem đơn của chính họ
    if (req.role !== 'admin' && req.role !== 'staff') {
      if (order.customer_id !== req.userId) {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve order', error: error.message });
  }
};

// GET CakeOrders by Shop ID (with role check)
export const getCakeOrdersByShopId = async (req, res) => {
  try {
    const { shop_id } = req.params;

    // Tìm shop để check quyền
    const shop = await Shop.findByPk(shop_id);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    // Nếu không phải admin/staff → chỉ được xem shop của chính mình
    if (req.role !== 'admin' && req.role !== 'staff') {
      if (shop.user_id !== req.userId) {
        return res.status(403).json({ message: 'Not authorized to view orders of this shop' });
      }
    }

    // Lấy danh sách orders
    const orders = await CakeOrder.findAll({
      where: {
        shop_id,
      },
      include: [
        {
          model: OrderDetail,
          as: 'orderDetails'
        },
        {
          model: User,
          attributes: ['id', 'username', 'full_name', 'email', 'address', 'phone_number']
        },
        {
          model: Shop,
          attributes: ['shop_id', 'business_name', 'phone_number', 'business_address']
        },
      ]
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve orders', error: error.message });
  }
};

// UPDATE CakeOrder (including size)
export const updateCakeOrder = async (req, res) => {
  const { id } = req.params;
  const {
    base_price,
    size,
    special_instructions,
    tier,
    order_details = []
  } = req.body;

  const transaction = await sequelize.transaction();

  try {
    const order = await CakeOrder.findByPk(id);

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Only pending orders can be updated' });
    }

    let ingredient_total = 0;

    // Xóa OrderDetail cũ
    await OrderDetail.destroy({ where: { order_id: id }, transaction });

    if (Array.isArray(order_details) && order_details.length > 0) {
      // Tính tổng giá nguyên liệu mới
      for (const item of order_details) {
        const ingredient = await Ingredient.findByPk(item.ingredient_id);
        if (!ingredient) throw new Error(`Ingredient ID ${item.ingredient_id} not found`);
        ingredient_total += parseFloat(ingredient.price) * item.quantity;
      }

      // Tạo OrderDetail mới
      for (const item of order_details) {
        const ingredient = await Ingredient.findByPk(item.ingredient_id);
        await OrderDetail.create({
          order_id: id,
          ingredient_id: item.ingredient_id,
          quantity: item.quantity,
          total_price: (parseFloat(ingredient.price) * item.quantity).toFixed(2)
        }, { transaction });
      }
    }

    const total_price = parseFloat(base_price || order.base_price) + ingredient_total;

    // Cập nhật CakeOrder
    await CakeOrder.update({
      base_price: base_price || order.base_price,
      size: size || order.size,
      tier,
      ingredient_total,
      total_price,
      special_instructions: special_instructions !== undefined ? special_instructions : order.special_instructions
    }, {
      where: { id },
      transaction
    });

    await transaction.commit();

    const updatedOrder = await CakeOrder.findOne({
      where: { id },
      include: {
        model: OrderDetail,
        as: 'orderDetails'
      }
    });

    res.status(200).json({ message: 'Order updated successfully', order: updatedOrder });

  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Failed to update order', error: error.message });
  }
};

// UPDATE status to "ordered" only if current status = "pending"
export const markOrderAsOrdered = [
  verifyToken, // ✅ middleware check JWT
  async (req, res) => {
    try {
      const order = await CakeOrder.findByPk(req.params.id, {
        include: [{ model: Shop, as: 'shop' }]
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // ✅ Lấy user từ token
      const currentUser = req.user;

      // ✅ Chỉ shop owner hoặc admin/staff được phép update
      if (currentUser.role !== 'admin' && currentUser.role !== 'staff') {
        if (order.shop.user_id !== currentUser.id) {
          return res.status(403).json({ message: 'Not authorized to update this order' });
        }
      }

      if (order.status !== 'pending') {
        return res.status(400).json({ message: 'Only pending orders can be marked as ordered' });
      }

      await order.update({ status: 'ordered' });

      res.status(200).json({ message: 'Order marked as ordered' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update order', error: error.message });
    }
  }
];

// UPDATE status to "completed" + release payment with 5% fee
export const markOrderAsCompleted = async (req, res) => {
  const dbTransaction = await sequelize.transaction();

  try {
    const { id: userId, role } = req.user; // lấy từ verifyToken

    // 1. Lấy order
    const order = await CakeOrder.findByPk(req.params.id, { transaction: dbTransaction });
    if (!order) {
      await dbTransaction.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }

    // ✅ Chỉ cho phép customer của order update (trừ khi admin/staff)
    if (role !== 'admin' && role !== 'staff') {
      if (order.customer_id !== userId) {
        await dbTransaction.rollback();
        return res.status(403).json({ message: 'Not authorized to complete this order' });
      }
    }

    if (order.status !== 'shipped') {
      await dbTransaction.rollback();
      return res.status(400).json({ message: 'Only shipped orders can be marked as completed' });
    }

    // 2. Lấy transaction pending (escrow)
    const originalPayment = await Transaction.findOne({
      where: {
        order_id: order.id,
        transaction_type: 'order_payment',
        status: 'pending'
      },
      transaction: dbTransaction
    });
    if (!originalPayment) {
      await dbTransaction.rollback();
      return res.status(404).json({ message: 'No pending payment transaction found for this order' });
    }

    // 3. Lấy shop -> user_id của chủ shop
    const shop = await Shop.findByPk(order.shop_id, { transaction: dbTransaction });
    if (!shop) {
      await dbTransaction.rollback();
      return res.status(404).json({ message: 'Shop not found' });
    }

    // 4. Lấy shop wallet (theo user_id của shop owner)
    const shopWallet = await Wallet.findOne({
      where: { user_id: shop.user_id },
      transaction: dbTransaction
    });
    if (!shopWallet) {
      await dbTransaction.rollback();
      return res.status(404).json({ message: 'Shop wallet not found' });
    }

    // 5. Lấy admin wallet
    const ADMIN_USER_ID = 1; // <-- nên config ENV
    const adminWallet = await Wallet.findOne({
      where: { user_id: ADMIN_USER_ID },
      transaction: dbTransaction
    });
    if (!adminWallet) {
      await dbTransaction.rollback();
      return res.status(404).json({ message: 'Admin wallet not found' });
    }

    // 6. Tính toán chia tiền
    const totalAmount = parseFloat(originalPayment.amount);
    const shopShare = parseFloat((totalAmount * 0.95).toFixed(2));
    const adminShare = parseFloat((totalAmount * 0.05).toFixed(2));

    // 7. Update shop wallet
    const newShopBalance = parseFloat(shopWallet.balance) + shopShare;
    await shopWallet.update(
      { balance: newShopBalance, updated_at: new Date() },
      { transaction: dbTransaction }
    );

    // 8. Update admin wallet
    const newAdminBalance = parseFloat(adminWallet.balance) + adminShare;
    await adminWallet.update(
      { balance: newAdminBalance, updated_at: new Date() },
      { transaction: dbTransaction }
    );

    // 9. Update transaction (escrow → completed)
    await originalPayment.update(
      {
        status: 'completed',
        description: `Released payment for order #${order.id}. Shop received 95%, Admin received 5%`
      },
      { transaction: dbTransaction }
    );

    // 10. Update order status
    await order.update(
      { status: 'completed' },
      { transaction: dbTransaction }
    );

    await dbTransaction.commit();

    res.status(200).json({
      message: 'Order marked as completed and payment released',
      payment: {
        transaction_id: originalPayment.id,
        total_amount: totalAmount,
        shop_received: shopShare,
        admin_fee: adminShare,
        shop_wallet_balance: newShopBalance,
        admin_wallet_balance: newAdminBalance
      }
    });

  } catch (error) {
    await dbTransaction.rollback();
    console.error('markOrderAsCompleted error:', error);
    res.status(500).json({
      message: 'Failed to complete order and release payment',
      error: error.message
    });
  }
};

// Soft DELETE: update status to "cancelled" and process refund
export const cancelCakeOrder = async (req, res) => {
  const dbTransaction = await sequelize.transaction();

  try {
    const { id: userId, role } = req.user; // lấy từ verifyToken

    // 1. Lấy order
    const order = await CakeOrder.findByPk(req.params.id, { transaction: dbTransaction });

    if (!order) {
      await dbTransaction.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }

    // ✅ Chỉ cho phép customer hủy (trừ admin/staff)
    if (role !== 'admin' && role !== 'staff') {
      if (order.customer_id !== userId) {
        await dbTransaction.rollback();
        return res.status(403).json({ message: 'Not authorized to cancel this order' });
      }
    }

    if (order.status !== 'pending') {
      await dbTransaction.rollback();
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    // 1. Tìm transaction thanh toán gốc của đơn hàng này
    const originalPayment = await Transaction.findOne({
      where: {
        order_id: order.id,
        transaction_type: 'order_payment',
        status: 'pending' // Tìm transaction đang pending để refund
      },
      transaction: dbTransaction
    });

    if (!originalPayment) {
      await dbTransaction.rollback();
      return res.status(404).json({
        message: 'Original payment transaction not found for this order'
      });
    }

    // 2. Tìm ví của customer để hoàn tiền
    const customerWallet = await Wallet.findOne({
      where: { user_id: order.customer_id },
      transaction: dbTransaction
    });

    if (!customerWallet) {
      await dbTransaction.rollback();
      return res.status(404).json({
        message: 'Customer wallet not found'
      });
    }

    // 3. Hoàn tiền vào ví customer
    const refundAmount = parseFloat(order.total_price);
    const currentBalance = parseFloat(customerWallet.balance);
    const newBalance = currentBalance + refundAmount;

    await Wallet.update(
      {
        balance: newBalance,
        updated_at: new Date()
      },
      {
        where: { user_id: order.customer_id },
        transaction: dbTransaction
      }
    );

    // 4. Update transaction gốc thành refund và completed (để refund)
    await Transaction.update(
      {
        transaction_type: 'order_payment',
        status: 'cancelled',
        description: `Refunded payment for cancelled cake order #${order.id}`
      },
      {
        where: { id: originalPayment.id },
        transaction: dbTransaction
      }
    );

    // 5. Cập nhật status đơn hàng thành cancelled
    await CakeOrder.update(
      { status: 'cancelled' },
      {
        where: { id: req.params.id },
        transaction: dbTransaction
      }
    );

    await dbTransaction.commit();

    res.status(200).json({
      message: 'Order cancelled successfully and refund processed',
      refund: {
        transaction_id: originalPayment.id,
        refund_amount: refundAmount,
        previous_balance: currentBalance,
        new_balance: newBalance
      }
    });

  } catch (error) {
    await dbTransaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Failed to cancel order and process refund', error: error.message });
  }
};

// middleware helper: check quyền
const canManageOrder = (order, req) => {
  // Admin hoặc staff thì luôn được phép
  if (req.role === 'admin' || req.role === 'staff') return true;

  // Chủ shop mới được phép
  return order.shop.user_id === req.userId;
};

// UPDATE status to "prepared" (chỉ khi hiện tại = "ordered")
export const markOrderAsPrepared = async (req, res) => {
  try {
    const order = await CakeOrder.findByPk(req.params.id, {
      include: [{ model: Shop, as: 'shop' }]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!canManageOrder(order, req)) {
      return res.status(403).json({ message: 'Not authorized to prepare this order' });
    }

    if (order.status !== 'ordered') {
      return res.status(400).json({ message: 'Only ordered orders can be marked as prepared' });
    }

    await order.update({ status: 'prepared' });

    res.status(200).json({ message: 'Order marked as prepared' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order', error: error.message });
  }
};

// UPDATE status to "shipped" (chỉ khi hiện tại = "prepared")
export const markOrderAsShipped = async (req, res) => {
  try {
    const order = await CakeOrder.findByPk(req.params.id, {
      include: [{ model: Shop, as: 'shop' }]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!canManageOrder(order, req)) {
      return res.status(403).json({ message: 'Not authorized to ship this order' });
    }

    if (order.status !== 'prepared') {
      return res.status(400).json({ message: 'Only prepared orders can be marked as shipped' });
    }

    await order.update({
      status: 'shipped',
      shipped_at: new Date()
    });

    res.status(200).json({ message: 'Order marked as shipped' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order', error: error.message });
  }
};