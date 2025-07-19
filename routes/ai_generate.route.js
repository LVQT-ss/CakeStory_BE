import express from 'express';
import {
    generateImage,
    getUserGeneratedImages
} from '../controllers/ai_generate.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

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

export default router;
