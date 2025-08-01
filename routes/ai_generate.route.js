import express from 'express';
import {
    generateImage,
    getUserGeneratedImages,
    totalAmountAiGenerate
} from '../controllers/ai_generate.controller.js';
import { verifyToken, verifyAdmin } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/ai/generate:
 *   post:
 *     tags: [AI Generation]
 *     summary: Generate an AI image from a prompt
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The prompt to generate the image from
 *     responses:
 *       200:
 *         description: Image generated successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/generate', verifyToken, generateImage);

/**
 * @swagger
 * /api/ai/images:
 *   get:
 *     tags: [AI Generation]
 *     summary: Get all AI generated images for the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Images retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/images', verifyToken, getUserGeneratedImages);

/**
 * @swagger
 * /api/ai/totalAmountAiGenerate:
 *   get:
 *     summary: Get total amount spent on AI generation (Admin only)
 *     tags: [AI Generation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved total amount
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 totalAmount:
 *                   type: number
 *                   description: Total amount spent on AI generation in VND
 *                   example: 1000000
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User is not an admin
 *       500:
 *         description: Internal server error
 */
router.get('/totalAmountAiGenerate', verifyToken, verifyAdmin, totalAmountAiGenerate);


export default router;
