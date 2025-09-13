import express from 'express';
import {
    createCakeQuote,

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


export default router;
