import sequelize from '../database/db.js';
import CakeOrder from '../models/cake_order.model.js';
import OrderDetail from '../models/order_detail.model.js';
import Ingredient from '../models/Ingredient.model.js';

// CREATE CakeOrder with multiple OrderDetails
export const createCakeOrder = async (req, res) => {
  const {
    customer_id,
    shop_id,
    marketplace_post_id,
    base_price,
    status,
    special_instructions,
    order_details
  } = req.body;

  const transaction = await sequelize.transaction();

  try {
    let ingredient_total = 0;

    // Get prices of all ingredients
    for (const item of order_details) {
      const ingredient = await Ingredient.findByPk(item.ingredient_id);
      if (!ingredient) throw new Error(`Ingredient ID ${item.ingredient_id} not found`);
      ingredient_total += parseFloat(ingredient.price) * item.quantity;
    }

    const total_price = parseFloat(base_price) + ingredient_total;

    const newOrder = await CakeOrder.create({
      customer_id,
      shop_id,
      marketplace_post_id,
      base_price,
      ingredient_total,
      total_price,
      status,
      special_instructions,
    }, { transaction });

    for (const item of order_details) {
      const ingredient = await Ingredient.findByPk(item.ingredient_id);
      await OrderDetail.create({
        order_id: newOrder.id,
        ingredient_id: item.ingredient_id,
        quantity: item.quantity,
        total_price: (parseFloat(ingredient.price) * item.quantity).toFixed(2)
      }, { transaction });
    }

    await transaction.commit();
    res.status(201).json({ message: 'Cake order created successfully', order: newOrder });

  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// GET all CakeOrders
export const getAllCakeOrders = async (req, res) => {
  try {
    const orders = await CakeOrder.findAll({ include: OrderDetail });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve orders', error: error.message });
  }
};

// GET CakeOrder by ID
export const getCakeOrderById = async (req, res) => {
  try {
    const order = await CakeOrder.findByPk(req.params.id, { include: OrderDetail });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve order', error: error.message });
  }
};

// UPDATE CakeOrder (not order_details)
export const updateCakeOrder = async (req, res) => {
  try {
    const [updated] = await CakeOrder.update(req.body, {
      where: { id: req.params.id }
    });

    if (!updated) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json({ message: 'Order updated successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Failed to update order', error: error.message });
  }
};

// DELETE CakeOrder and related OrderDetails
export const deleteCakeOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const order = await CakeOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    await OrderDetail.destroy({ where: { order_id: order.id }, transaction });
    await CakeOrder.destroy({ where: { id: order.id }, transaction });

    await transaction.commit();
    res.status(200).json({ message: 'Order and its details deleted successfully' });

  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Failed to delete order', error: error.message });
  }
};
