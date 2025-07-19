import express from 'express';
import { createAlbum } from '../controllers/album.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/albums:
 *   post:
 *     tags:
 *       - Albums
 *     summary: Create a new album
 *     description: Create a new album container
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "My Birthday Album"
 *                 description: Name of the album
 *               description:
 *                 type: string
 *                 example: "Collection of photos from my birthday celebration"
 *                 description: Detailed description of the album
 *     responses:
 *       201:
 *         description: Album created successfully
 *       400:
 *         description: Bad Request - Missing required fields
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.post('/', verifyToken, createAlbum);


export default router;
