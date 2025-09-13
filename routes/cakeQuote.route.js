import express from 'express';
import {
    createCakeQuote,
    getCakeQuotes,
    getCakeQuoteById,
    updateCakeQuoteStatus,
    deleteCakeQuote
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
 *   patch:
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

export default router;
