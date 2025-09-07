import express from 'express';
import {
    createPicture,

} from '../controllers/pictureCakeDesign.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/pictures/create:
 *   post:
 *     tags:
 *       - Picture For Cake Design
 *     summary: Create a new picture for cake design
 *     description: Create a new picture for cake design with image URL
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the picture
 *                 example: "Beautiful Wedding Cake Inspiration"
 *               imageUrl:
 *                 type: string
 *                 description: URL of the image
 *                 example: "https://example.com/cake-image.jpg"
 *     responses:
 *       201:
 *         description: Picture created successfully
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
 *                   example: "Picture for cake design created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Beautiful Wedding Cake Inspiration"
 *                     imageUrl:
 *                       type: string
 *                       example: "https://firebase.com/image.jpg"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.post('/create', verifyToken, createPicture);



export default router;
