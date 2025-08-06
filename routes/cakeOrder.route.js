import express from 'express';
import {
  createCakeOrder,
  getAllCakeOrders,
  getCakeOrderById,
  getCakeOrdersByShopId,
  markOrderAsOrdered,
  markOrderAsCompleted,
  cancelCakeOrder,
  markOrderAsShipped
} from '../controllers/cakeOrder.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: CakeOrder
 *   description: APIs for managing custom cake orders
 */

/**
 * @swagger
 * /api/cake-orders:
 *   post:
 *     tags: [CakeOrder]
 *     summary: Create a new cake order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_id
 *               - shop_id
 *               - base_price
 *               - order_details
 *             properties:
 *               customer_id:
 *                 type: integer
 *               shop_id:
 *                 type: integer
 *               marketplace_post_id:
 *                 type: integer
 *               base_price:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [pending, ordered, completed, cancelled]
 *               special_instructions:
 *                 type: string
 *               order_details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [ingredient_id, quantity]
 *                   properties:
 *                     ingredient_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Cake order created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', verifyToken, createCakeOrder);

/**
 * @swagger
 * /api/cake-orders:
 *   get:
 *     tags: [CakeOrder]
 *     summary: Get all non-cancelled cake orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', verifyToken, getAllCakeOrders);

/**
 * @swagger
 * /api/cake-orders/{id}:
 *   get:
 *     tags: [CakeOrder]
 *     summary: Get a cake order by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cake order ID
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get('/:id', verifyToken, getCakeOrderById);

/**
 * @swagger
 * /api/cake-orders/shop/{shop_id}:
 *   get:
 *     tags: [CakeOrder]
 *     summary: Get cake orders by shop ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shop ID
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/shop/:shop_id', verifyToken, getCakeOrdersByShopId);

/**
 * @swagger
 * /api/cake-orders/{id}/ordered:
 *   put:
 *     tags: [CakeOrder]
 *     summary: Mark a cake order as "ordered"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cake order ID
 *     responses:
 *       200:
 *         description: Order marked as ordered
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.put('/:id/ordered', verifyToken, markOrderAsOrdered);

/**
 * @swagger
 * /api/cake-orders/{id}/complete:
 *   put:
 *     tags: [CakeOrder]
 *     summary: Mark a cake order as completed
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cake order ID
 *     responses:
 *       200:
 *         description: Order completed successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.put('/:id/complete', verifyToken, markOrderAsCompleted);

/**
 * @swagger
 * /api/cake-orders/{id}/cancel:
 *   put:
 *     tags: [CakeOrder]
 *     summary: Cancel (soft delete) a cake order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cake order ID
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.put('/:id/cancel', verifyToken, cancelCakeOrder);

/**
 * @swagger
 * /api/cake-orders/{id}/ship:
 *   put:
 *     tags: [CakeOrder]
 *     summary: Mark a cake order as shipped
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cake order ID
 *     responses:
 *       200:
 *         description: Order marked as shipped
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.put('/:id/ship', verifyToken, markOrderAsShipped);

export default router;
