import express from 'express';
import {
  createShop,
  getAllShops,
  getShopByUserId,
  updateShop,
  deleteShop,
  getShopByName
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
 *               - user_id
 *               - business_name
 *               - longtitue
 *               - latitude
 *             properties:
 *               user_id:
 *                 type: integer
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
 * /api/shops:
 *   get:
 *     tags:
 *       - Shop
 *     summary: Get all shops
 *     description: Retrieve all shops
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
 *         description: Shop retrieved successfully
 *       404:
 *         description: Shop not found
 *       500:
 *         description: Server error
 */
router.get('/:userId', verifyToken, getShopByUserId);

/**
 * @swagger
 * /api/shops/{userId}:
 *   put:
 *     tags:
 *       - Shop
 *     summary: Update shop
 *     description: Update an existing shop by user ID
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
 *     responses:
 *       200:
 *         description: Shop updated successfully
 *       404:
 *         description: Shop not found
 *       500:
 *         description: Server error
 */
router.put('/:userId', verifyToken, updateShop);

/**
 * @swagger
 * /api/shops/{userId}:
 *   delete:
 *     tags:
 *       - Shop
 *     summary: Delete shop
 *     description: Delete a shop by user ID
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
 *         description: Shop deleted successfully
 *       404:
 *         description: Shop not found
 *       500:
 *         description: Server error
 */
router.delete('/:userId', verifyToken, deleteShop);

/**
 * @swagger
 * /api/shops/name/{name}:
 *   get:
 *     tags:
 *       - Shop
 *     summary: Get shops by name
 *     description: Retrieve active shops whose names match the given keyword
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Keyword to match in shop name
 *     responses:
 *       200:
 *         description: Shops retrieved successfully
 *       404:
 *         description: No matching shops found
 *       500:
 *         description: Server error
 */
router.get('/name/:name', verifyToken, getShopByName);

export default router;
