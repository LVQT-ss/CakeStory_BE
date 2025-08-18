// routes/shop.route.js
import express from 'express';
import {
  createShop,
  getAllShops,
  getShopByUserId,
  updateShop,
  deleteShop,
  getShopByName,
  getAllShopsInactive,
  getShopTotalCustomers,
  getShopOrderStats,
  getShopRevenue,
  getShopRevenueThisMonth
} from '../controllers/shop.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/shops:
 *   post:
 *     tags:
 *       - Shop
 *     summary: Create a shop
 *     description: Create a new shop (only 1 per user)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_name
 *               - longtitue
 *               - latitude
 *             properties:
 *               business_name:
 *                 type: string
 *               business_address:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               specialty:
 *                 type: string
 *               bio:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *               longtitue:
 *                 type: number
 *               latitude:
 *                 type: number
 *               business_hours:
 *                 type: string
 *               delivery_area:
 *                 type: string
 *               background_image:
 *                 type: string
 *               avatar_image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Shop created successfully
 *       400:
 *         description: Shop already exists
 *       500:
 *         description: Server error
 */
router.post('/', verifyToken, createShop);

/**
 * @swagger
 * /api/shops/all:
 *   get:
 *     tags:
 *       - Shop
 *     summary: Get all shops (including inactive)
 *     description: Retrieve all shops regardless of is_active status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All shops retrieved
 *       500:
 *         description: Server error
 */
router.get('/all', verifyToken, getAllShopsInactive); 

/**
 * @swagger
 * /api/shops:
 *   get:
 *     tags:
 *       - Shop
 *     summary: Get all shops
 *     description: Retrieve all active shops
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Shops retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', verifyToken, getAllShops);

/**
 * @swagger
 * /api/shops/name/{name}:
 *   get:
 *     tags:
 *       - Shop
 *     summary: Get shops by name
 *     description: Retrieve active shops matching the name
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shops found
 *       404:
 *         description: No shop matches
 */
router.get('/name/:name', getShopByName);

/**
 * @swagger
 * /api/shops/{userId}:
 *   get:
 *     tags:
 *       - Shop
 *     summary: Get shop by user ID
 *     description: Retrieve a shop using the user's ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Shop retrieved
 *       404:
 *         description: Shop not found
 */
router.get('/:userId', getShopByUserId);

/**
 * @swagger
 * /api/shops/{userId}:
 *   put:
 *     tags:
 *       - Shop
 *     summary: Update shop
 *     description: Update shop info by user ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               business_name:
 *                 type: string
 *               business_address:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               specialty:
 *                 type: string
 *               bio:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *               longtitue:
 *                 type: number
 *               latitude:
 *                 type: number
 *               business_hours:
 *                 type: string
 *               delivery_area:
 *                 type: string
 *               background_image:
 *                 type: string
 *               avatar_image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Shop updated
 *       404:
 *         description: Shop not found
 */
router.put('/:userId', verifyToken, updateShop);

/**
 * @swagger
 * /api/shops/{userId}:
 *   delete:
 *     tags:
 *       - Shop
 *     summary: Deactivate shop
 *     description: 'Soft delete a shop by user ID (is_active = false)'
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Shop deactivated
 *       404:
 *         description: Shop not found
 */
router.delete('/:userId', verifyToken, deleteShop);

/**
 * @swagger
 * /api/shops/{shopId}/customers:
 *   get:
 *     tags:
 *       - Shop
 *     summary: Get shop customer statistics
 *     description: Retrieve total unique customers and order statistics for a specific shop
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shop ID to get customer statistics for
 *     responses:
 *       200:
 *         description: Shop customer statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Shop customer statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     shop_id:
 *                       type: integer
 *                       example: 1
 *                     shop_name:
 *                       type: string
 *                       example: "Sweet Dreams Bakery"
 *                     total_unique_customers:
 *                       type: integer
 *                       description: Number of unique customers who have ordered
 *                       example: 25
 *                     total_orders:
 *                       type: integer
 *                       description: Total number of orders (excluding cancelled)
 *                       example: 45
 *                     completed_orders:
 *                       type: integer
 *                       description: Number of completed orders
 *                       example: 40
 *                     pending_orders:
 *                       type: integer
 *                       description: Number of pending orders
 *                       example: 5
 *                     average_orders_per_customer:
 *                       type: string
 *                       description: Average orders per customer
 *                       example: "1.80"
 *       404:
 *         description: Shop not found
 *       500:
 *         description: Server error
 */
router.get('/:shopId/customers', verifyToken, getShopTotalCustomers);

/**
 * @swagger
 * /api/shops/{shopId}/orderStats:
 *   get:
 *     tags:
 *       - Shop
 *     summary: Get shop order statistics
 *     description: Retrieve comprehensive order statistics for a specific shop
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shop ID to get order statistics for
 *     responses:
 *       200:
 *         description: Shop order statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Shop order statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     shop_id:
 *                       type: integer
 *                       example: 1
 *                     shop_name:
 *                       type: string
 *                       example: "Sweet Dreams Bakery"
 *                     order_statistics:
 *                       type: object
 *                       properties:
 *                         total_orders:
 *                           type: integer
 *                           description: Total number of orders (excluding cancelled)
 *                           example: 45
 *                         completed_orders:
 *                           type: integer
 *                           description: Number of completed orders
 *                           example: 40
 *                         pending_orders:
 *                           type: integer
 *                           description: Number of pending orders
 *                           example: 5
 *                         ordered_orders:
 *                           type: integer
 *                           description: Number of ordered orders
 *                           example: 3
 *                         shipped_orders:
 *                           type: integer
 *                           description: Number of shipped orders
 *                           example: 2
 *                         cancelled_orders:
 *                           type: integer
 *                           description: Number of cancelled orders
 *                           example: 10
 *                         complaining_orders:
 *                           type: integer
 *                           description: Number of orders with complaints
 *                           example: 1
 *                     completion_rate:
 *                       type: string
 *                       description: Percentage of completed orders
 *                       example: "88.89"
 *       404:
 *         description: Shop not found
 *       500:
 *         description: Server error
 */
router.get('/:shopId/orderStats', verifyToken, getShopOrderStats);

/**
 * @swagger
 * /api/shops/{shopId}/revenue:
 *   get:
 *     tags:
 *       - Shop
 *     summary: Get shop revenue statistics by order status
 *     description: Retrieve detailed financial breakdown for a specific shop based on order status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shop ID to get revenue statistics for
 *     responses:
 *       200:
 *         description: Shop revenue statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Shop revenue statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     shop_id:
 *                       type: integer
 *                       example: 1
 *                     shop_name:
 *                       type: string
 *                       example: "Sweet Dreams Bakery"
 *                     financial_summary:
 *                       type: object
 *                       properties:
 *                         ordered_money:
 *                           type: string
 *                           description: Money from ordered orders (VND)
 *                           example: "200000.00"
 *                         completed_money:
 *                           type: string
 *                           description: Money from completed orders (VND)
 *                           example: "5000000.00"
 *                         cancelled_money:
 *                           type: string
 *                           description: Money from cancelled orders (VND)
 *                           example: "250000.00"
 *                         complaining_money:
 *                           type: string
 *                           description: Money from complaining orders (VND)
 *                           example: "50000.00"
 *                     totals:
 *                       type: object
 *                       properties:
 *                         total_money:
 *                           type: string
 *                           description: Total money across all order statuses (VND)
 *                           example: "5750000.00"
 *                         active_money:
 *                           type: string
 *                           description: Money from active orders (pending+ordered+shipped+complaining) (VND)
 *                           example: "500000.00"
 *                         earned_money:
 *                           type: string
 *                           description: Money from completed orders (earned revenue) (VND)
 *                           example: "5000000.00"
 *       404:
 *         description: Shop not found
 *       500:
 *         description: Server error
 */
router.get('/:shopId/revenue', verifyToken, getShopRevenue);

/**
 * @swagger
 * /api/shops/{shopId}/revenue/month:
 *   get:
 *     tags:
 *       - Shop
 *     summary: Get shop revenue statistics for current month
 *     description: Retrieve financial breakdown for a specific shop for the current month only
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shop ID to get monthly revenue statistics for
 *     responses:
 *       200:
 *         description: Shop monthly revenue statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Shop revenue statistics for this month retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     shop_id:
 *                       type: integer
 *                       example: 1
 *                     shop_name:
 *                       type: string
 *                       example: "Sweet Dreams Bakery"
 *                     month_info:
 *                       type: object
 *                       properties:
 *                         current_month:
 *                           type: string
 *                           description: Current month and year
 *                           example: "December 2024"
 *                         start_date:
 *                           type: string
 *                           description: Start date of current month
 *                           example: "2024-12-01"
 *                         end_date:
 *                           type: string
 *                           description: End date of current month
 *                           example: "2024-12-31"
 *                     financial_summary:
 *                       type: object
 *                       properties:
 *                         ordered_money:
 *                           type: string
 *                           description: Money from ordered orders this month (VND)
 *                           example: "50000.00"
 *                         completed_money:
 *                           type: string
 *                           description: Money from completed orders this month (VND)
 *                           example: "150000.00"
 *                         cancelled_money:
 *                           type: string
 *                           description: Money from cancelled orders this month (VND)
 *                           example: "25000.00"
 *                         complaining_money:
 *                           type: string
 *                           description: Money from complaining orders this month (VND)
 *                           example: "10000.00"
 *       404:
 *         description: Shop not found
 *       500:
 *         description: Server error
 */
router.get('/:shopId/revenue/month', verifyToken, getShopRevenueThisMonth);

export default router;
