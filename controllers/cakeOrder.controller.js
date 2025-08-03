import sequelize from '../database/db.js';
import CakeOrder from '../models/cake_order.model.js';
import OrderDetail from '../models/order_detail.model.js';
import Ingredient from '../models/Ingredient.model.js';
import { Op } from 'sequelize';

// CREATE CakeOrder with multiple OrderDetails
export const createCakeOrder = async (req, res) => {
  const {
    customer_id,
    shop_id,
    marketplace_post_id,
    base_price,
    special_instructions,
    order_details = []
  } = req.body;

  const transaction = await sequelize.transaction();

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

    const newOrder = await CakeOrder.create({
      customer_id,
      shop_id,
      marketplace_post_id,
      base_price,
      ingredient_total,
      total_price,
      status: 'pending',
      special_instructions,
    }, { transaction });

    // Tạo OrderDetail nếu có
    if (Array.isArray(order_details) && order_details.length > 0) {
      for (const item of order_details) {
        const ingredient = await Ingredient.findByPk(item.ingredient_id);
        await OrderDetail.create({
          order_id: newOrder.id,
          ingredient_id: item.ingredient_id,
          quantity: item.quantity,
          total_price: (parseFloat(ingredient.price) * item.quantity).toFixed(2)
        }, { transaction });
      }
    }

    await transaction.commit();
    res.status(201).json({ message: 'Cake order created successfully', order: newOrder });

  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// GET all CakeOrders (excluding cancelled)
export const getAllCakeOrders = async (req, res) => {
  try {
    const orders = await CakeOrder.findAll({
      where: {
        status: { [Op.ne]: 'cancelled' }
      },
      include: OrderDetail
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
      include: OrderDetail
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
      include: OrderDetail
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve orders', error: error.message });
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

// Soft DELETE: update status to "cancelled"
export const cancelCakeOrder = async (req, res) => {
  try {
    const [updated] = await CakeOrder.update(
      { status: 'cancelled' },
      { where: { id: req.params.id } }
    );

    if (!updated) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel order', error: error.message });
  }
  
};
