import express from 'express';
import {
    createPicture,
    deletePicture,
    getPicturesByUserId
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


/**
 * @swagger
 * /api/pictures/{id}:
 *   delete:
 *     tags:
 *       - Picture For Cake Design
 *     summary: Delete picture
 *     description: Delete a picture for cake design (only owner can delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Picture ID
 *     responses:
 *       200:
 *         description: Picture deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Picture not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id', verifyToken, deletePicture);

/**
 * @swagger
 * /api/pictures/user/{userId}:
 *   get:
 *     tags:
 *       - Picture For Cake Design
 *     summary: Get pictures by user ID
 *     description: Retrieve all pictures for cake design created by a specific user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
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
 *         description: Pictures by user fetched successfully
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Internal Server Error
 */
router.get('/user/:userId', verifyToken, getPicturesByUserId);

export default router;
