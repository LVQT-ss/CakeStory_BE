import express from 'express';
import {
  createShop,
  getAllShops,
  getShopByUserId,
  updateShop,
  deleteShop,
  getShopByName,
  createMarketplacePost
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
router.get('/name/:name', verifyToken, getShopByName);

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
router.get('/:userId', verifyToken, getShopByUserId);

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
 * /api/shops/marketplace-post:
 *   post:
 *     tags:
 *       - Shop
 *     summary: Create a marketplace post
 *     description: Create a marketplace post under an active shop
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: integer
 *               available:
 *                 type: boolean
 *               expiry_date:
 *                 type: string
 *                 format: date
 *               is_public:
 *                 type: boolean
 *               media:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     image_url:
 *                       type: string
 *                     video_url:
 *                       type: string
 *     responses:
 *       201:
 *         description: Marketplace post created
 *       403:
 *         description: No active shop
 *       500:
 *         description: Server error
 */
router.post('/marketplace-post', verifyToken, createMarketplacePost);

export default router;
