import sequelize from '../database/db.js';
import CakeOrder from '../models/cake_order.model.js';
import OrderDetail from '../models/order_detail.model.js';
import Ingredient from '../models/Ingredient.model.js';
import Wallet from '../models/wallet.model.js';
import Transaction from '../models/transaction.model.js';
import { Op } from 'sequelize';

// CREATE CakeOrder with multiple OrderDetails and Payment Processing
export const createCakeOrder = async (req, res) => {
  const {
    customer_id,
    shop_id,
    marketplace_post_id,
    base_price,
    size,
    special_instructions,
    order_details = []
  } = req.body;

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

    // 2. Tạo đơn hàng trước
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
    }, { transaction: dbTransaction });

    // 3. Tạo OrderDetail nếu có
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

    // 4. Trừ tiền từ ví customer
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

    // 5. Tạo transaction record để tracking
    const paymentTransaction = await Transaction.create({
      from_wallet_id: customerWallet.id,
      to_wallet_id: null, // Có thể để null hoặc wallet của shop nếu có
      order_id: newOrder.id,
      amount: total_price,
      transaction_type: 'order_payment',
      status: 'completed',
      description: `Payment for cake order #${newOrder.id}`
    }, { transaction: dbTransaction });

    await dbTransaction.commit();

    res.status(201).json({
      message: 'Cake order created and payment processed successfully',
      order: newOrder,
      payment: {
        transaction_id: paymentTransaction.id,
        amount_paid: total_price,
        previous_balance: currentBalance,
        new_balance: newBalance
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
      where: {
        status: { [Op.ne]: 'cancelled' }
      },
      include: {
        model: OrderDetail,
        as: 'orderDetails'
      }
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve orders', error: error.message });
  }
};

// GET CakeOrder by ID (excluding cancelled)
export const getCakeOrderById = async (req, res) => {
  try {
    const order = await CakeOrder.findOne({
      where: {
        id: req.params.id,
        status: { [Op.ne]: 'cancelled' }
      },
      include: {
        model: OrderDetail,
        as: 'orderDetails'
      }
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve order', error: error.message });
  }
};

// GET CakeOrders by Shop ID (excluding cancelled)
export const getCakeOrdersByShopId = async (req, res) => {
  try {
    const { shop_id } = req.params;
    const orders = await CakeOrder.findAll({
      where: {
        shop_id,
        status: { [Op.ne]: 'cancelled' }
      },
      include: {
        model: OrderDetail,
        as: 'orderDetails'
      }
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

// UPDATE status to "ordered"
export const markOrderAsOrdered = async (req, res) => {
  try {
    const [updated] = await CakeOrder.update(
      { status: 'ordered' },
      { where: { id: req.params.id } }
    );

    if (!updated) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json({ message: 'Order marked as ordered' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order', error: error.message });
  }
};

// UPDATE status to "completed"
export const markOrderAsCompleted = async (req, res) => {
  try {
    const [updated] = await CakeOrder.update(
      { status: 'completed' },
      { where: { id: req.params.id } }
    );

    if (!updated) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json({ message: 'Order marked as completed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order', error: error.message });
  }
};

// Soft DELETE: update status to "cancelled" and process refund
export const cancelCakeOrder = async (req, res) => {
  const dbTransaction = await sequelize.transaction();

  try {
    const order = await CakeOrder.findByPk(req.params.id, { transaction: dbTransaction });

    if (!order) {
      await dbTransaction.rollback();
      return res.status(404).json({ message: 'Order not found' });
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
        status: 'completed'
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

    // 4. Update transaction gốc thành refund
    await Transaction.update(
      {
        transaction_type: 'order_payment',
        status: 'completed',
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

// UPDATE status to "shipped" and set shipped_at timestamp NOTE : đang cho chủ shop để set shipped 
export const markOrderAsShipped = async (req, res) => {
  try {
    const order = await CakeOrder.findByPk(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status !== 'ordered') {
      return res.status(400).json({ message: 'Only ordered orders can be shipped' });
    }

    await CakeOrder.update(
      {
        status: 'shipped',
        shipped_at: new Date()
      },
      { where: { id: req.params.id } }
    );

    res.status(200).json({ message: 'Order marked as shipped' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order', error: error.message });
  }
};