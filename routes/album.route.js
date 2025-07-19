import express from 'express';
import { createAlbum, createAlbumPost } from '../controllers/album.controller.js';
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

/**
 * @swagger
 * /api/albums/posts:
 *   post:
 *     tags:
 *       - Albums
 *     summary: Create a new album post
 *     description: Create a new album post with media attachments
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
 *               - album_id
 *             properties:
 *               album_id:
 *                 type: integer
 *                 example: 1
 *                 description: ID of the album to add this post to
 *               title:
 *                 type: string
 *                 example: "Birthday Party Photos"
 *                 description: Title of the album post
 *               description:
 *                 type: string
 *                 example: "Photos from the birthday party"
 *                 description: Detailed description of the album post
 *               is_public:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *                 description: Whether the album post is visible to other users
 *               media:
 *                 type: array
 *                 description: Array of media attachments (images or videos)
 *                 items:
 *                   type: object
 *                   properties:
 *                     image_url:
 *                       type: string
 *                       example: "https://example.com/photo1.jpg"
 *                       description: URL of an image
 *                     video_url:
 *                       type: string
 *                       example: "https://example.com/video1.mp4"
 *                       description: URL of a video
 *     responses:
 *       201:
 *         description: Album post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Album post created successfully"
 *                 post:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Birthday Party Photos"
 *                     description:
 *                       type: string
 *                       example: "Photos from the birthday party"
 *                     post_type:
 *                       type: string
 *                       example: "album"
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     is_public:
 *                       type: boolean
 *                       example: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-20T10:00:00Z"
 *                     AlbumPost:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: "Birthday Party Photos"
 *                         description:
 *                           type: string
 *                           example: "Photos from the birthday party"
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-03-20T10:00:00Z"
 *                         Album:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             name:
 *                               type: string
 *                               example: "My Birthday Album"
 *                             description:
 *                               type: string
 *                               example: "Collection of photos from my birthday celebration"
 *                     media:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           image_url:
 *                             type: string
 *                             example: "https://example.com/photo1.jpg"
 *                           video_url:
 *                             type: string
 *                             example: null
 *       400:
 *         description: Bad Request - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Title and album_id are required"
 *       404:
 *         description: Album not found or access denied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Album not found or access denied"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied. No token provided."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating album post"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.post('/posts', verifyToken, createAlbumPost);

export default router;
