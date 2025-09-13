import express from 'express';
import {
    createCakeQuote,
    getCakeQuotes,
    getCakeQuoteById,
    updateCakeQuoteStatus,
    deleteCakeQuote,
    createShopQuote,
    getShopQuotesByCakeQuote,
    getShopQuotesByShop,
    acceptShopQuote,
    updateShopQuote
} from '../controllers/cakeQuote.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/cake-quotes:
 *   post:
 *     summary: Create a new cake quote request
 *     description: Create a cake quote request. User must have completed at least one cake order to use this feature.
 *     tags: [Cake Quotes]
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
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Birthday Cake for 20 People"
 *               description:
 *                 type: string
 *                 example: "Looking for a chocolate birthday cake with custom decorations"
 *               imageDesign:
 *                 type: string
 *                 example: "https://example.com/design.jpg"
 *               cake_size:
 *                 type: string
 *                 example: "8 inch"
 *               special_requirements:
 *                 type: string
 *                 example: "Gluten-free, no nuts"
 *               budget_range:
 *                 type: number
 *                 example: 500000
 *               expires_at:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T23:59:59Z"
 *     responses:
 *       201:
 *         description: Cake quote created successfully
 *       400:
 *         description: Bad request or user hasn't completed any orders
 *       401:
 *         description: Unauthorized
 */
router.post('/', verifyToken, createCakeQuote);

/**
 * @swagger
 * /api/cake-quotes:
 *   get:
 *     summary: Get all cake quotes
 *     tags: [Cake Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Cake quotes retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', verifyToken, getCakeQuotes);

/**
 * @swagger
 * /api/cake-quotes/my-shop-quotes:
 *   get:
 *     summary: Get shop quotes for the current user's shop
 *     tags: [Shop Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Shop quotes retrieved successfully
 *       404:
 *         description: Shop not found for user
 *       401:
 *         description: Unauthorized
 */
router.get('/my-shop-quotes', verifyToken, getShopQuotesByShop);

/**
 * @swagger
 * /api/cake-quotes/{id}:
 *   get:
 *     summary: Get a specific cake quote by ID
 *     tags: [Cake Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cake quote retrieved successfully
 *       404:
 *         description: Cake quote not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', verifyToken, getCakeQuoteById);

/**
 * @swagger
 * /api/cake-quotes/{id}/status:
 *   put:
 *     summary: Update cake quote status
 *     tags: [Cake Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, closed, expired]
 *                 example: "closed"
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status
 *       403:
 *         description: Can only update own quotes
 *       404:
 *         description: Quote not found
 */
router.patch('/:id/status', verifyToken, updateCakeQuoteStatus);

/**
 * @swagger
 * /api/cake-quotes/{id}:
 *   delete:
 *     summary: Delete a cake quote
 *     tags: [Cake Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Quote deleted successfully
 *       403:
 *         description: Can only delete own quotes
 *       404:
 *         description: Quote not found
 */
router.delete('/:id', verifyToken, deleteCakeQuote);

// ============ SHOP QUOTE ROUTES ============

/**
 * @swagger
 * /api/cake-quotes/shop-quotes:
 *   post:
 *     summary: Create a shop quote for a cake quote
 *     description: Shop owners can create quotes for open cake quote requests
 *     tags: [Shop Quotes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cake_quote_id
 *               - quoted_price
 *             properties:
 *               cake_quote_id:
 *                 type: integer
 *                 example: 1
 *               quoted_price:
 *                 type: number
 *                 format: decimal
 *                 example: 500000
 *               preparation_time:
 *                 type: integer
 *                 example: 24
 *                 description: Hours needed to prepare
 *               message:
 *                 type: string
 *                 example: "We specialize in custom birthday cakes"
 *               ingredients_breakdown:
 *                 type: string
 *                 example: "Chocolate sponge, vanilla cream, fresh strawberries"
 *     responses:
 *       201:
 *         description: Shop quote created successfully
 *       400:
 *         description: Bad request or validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shop not found for user
 */
router.post('/shop-quotes', verifyToken, createShopQuote);

/**
 * @swagger
 * /api/cake-quotes/{cake_quote_id}/shop-quotes:
 *   get:
 *     summary: Get all shop quotes for a specific cake quote
 *     tags: [Shop Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cake_quote_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Shop quotes retrieved successfully
 *       404:
 *         description: Cake quote not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:cake_quote_id/shop-quotes', verifyToken, getShopQuotesByCakeQuote);

/**
 * @swagger
 * /api/cake-quotes/shop-quotes/{shop_quote_id}/accept:
 *   put:
 *     summary: Accept a shop quote
 *     description: Cake quote owner can accept a shop quote, closing the cake quote
 *     tags: [Cake Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shop_quote_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Shop quote accepted successfully
 *       400:
 *         description: Quote already processed or cake quote closed
 *       403:
 *         description: Can only accept quotes for own cake requests
 *       404:
 *         description: Shop quote not found
 *       401:
 *         description: Unauthorized
 */
router.put('/shop-quotes/:shop_quote_id/accept', verifyToken, acceptShopQuote);

/**
 * @swagger
 * /api/cake-quotes/shop-quotes/{shop_quote_id}:
 *   put:
 *     summary: Update a shop quote
 *     description: Shop owner can update their own pending quotes
 *     tags: [Shop Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shop_quote_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quoted_price:
 *                 type: number
 *                 format: decimal
 *                 example: 550000
 *               preparation_time:
 *                 type: integer
 *                 example: 48
 *               message:
 *                 type: string
 *                 example: "Updated message with more details"
 *               ingredients_breakdown:
 *                 type: string
 *                 example: "Premium chocolate, organic cream, imported vanilla"
 *     responses:
 *       200:
 *         description: Shop quote updated successfully
 *       400:
 *         description: Can only update pending quotes or validation error
 *       403:
 *         description: Can only update own quotes
 *       404:
 *         description: Shop quote not found
 *       401:
 *         description: Unauthorized
 */
router.put('/shop-quotes/:shop_quote_id', verifyToken, updateShopQuote);

export default router;
