import express from 'express';
import {
  createCakeOrder,
  getAllCakeOrders,
  getCakeOrderById,
  getCakeOrdersByShopId,
  markOrderAsOrdered,
  markOrderAsCompleted,
  cancelCakeOrder,
  markOrderAsShipped,
  getCakeOrdersByUserId,
  markOrderAsPrepared
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
 *               - shop_id
 *               - base_price
 *               - size
 *               - tier
 *               - order_details
 *               - delivery_time
 *             properties:
 *               shop_id:
 *                 type: integer
 *               marketplace_post_id:
 *                 type: integer
 *               base_price:
 *                 type: number
 *               size:
 *                 type: string
 *                 example: "Medium"
 *               tier:
 *                 type: integer
 *                 example: 2
 *               delivery_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-09-20T14:00:00.000Z"
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
 *     summary: Get all cake orders
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
 * /api/cake-orders/user/{user_id}:
 *   get:
 *     tags: [CakeOrder]
 *     summary: Get cake orders by user ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID (customer)
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/user/:user_id', verifyToken, getCakeOrdersByUserId);

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

/**
 * @swagger
 * /api/cake-orders/{id}/prepared:
 *   put:
 *     tags: [CakeOrder]
 *     summary: Mark a cake order as prepared
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
 *         description: Order marked as prepared
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.put('/:id/prepared', verifyToken, markOrderAsPrepared);

export default router;
