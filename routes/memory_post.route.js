import express from 'express';
import { createMemoryPost, getMemoryPostById } from '../controllers/memoryPost.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/memory-posts:
 *   post:
 *     tags:
 *       - Memory Posts
 *     summary: Create a new memory post
 *     description: Create a memory post to share special moments, events, or memories with optional media attachments
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
 *                 example: "My Amazing Birthday Cake"
 *                 description: Title of the memory post
 *               description:
 *                 type: string
 *                 example: "This is the beautiful cake I made for my birthday celebration. It was chocolate with vanilla frosting!"
 *                 description: Detailed description of the memory
 *               event_date:
 *                 type: string
 *                 format: date
 *                 example: "2024-03-20"
 *                 description: Date when the memory/event occurred
 *               event_type:
 *                 type: string
 *                 example: "Birthday"
 *                 description: Type of event or occasion
 *               is_public:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *                 description: Whether the memory post is visible to other users
 *               media:
 *                 type: array
 *                 description: Array of media attachments (images or videos)
 *                 items:
 *                   type: object
 *                   properties:
 *                     image_url:
 *                       type: string
 *                       example: "https://example.com/cake-image.jpg"
 *                       description: URL of an image
 *                     video_url:
 *                       type: string
 *                       example: "https://example.com/cake-video.mp4"
 *                       description: URL of a video
 *     responses:
 *       201:
 *         description: Memory post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Memory post created successfully"
 *                 post:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "My Amazing Birthday Cake"
 *                     description:
 *                       type: string
 *                       example: "This is the beautiful cake I made for my birthday celebration."
 *                     post_type:
 *                       type: string
 *                       example: "memory"
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
 *                     MemoryPost:
 *                       type: object
 *                       properties:
 *                         event_date:
 *                           type: string
 *                           format: date
 *                           example: "2024-03-20"
 *                         event_type:
 *                           type: string
 *                           example: "Birthday"
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
 *                             example: "https://example.com/cake-image.jpg"
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
 *                   example: "Title is required"
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
 *                   example: "Error creating memory post"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.post('/', verifyToken, createMemoryPost);

/**
 * @swagger
 * /api/memory-posts/{id}:
 *   get:
 *     tags:
 *       - Memory Posts
 *     summary: Get a memory post by ID
 *     description: Retrieve a specific memory post by its ID. This endpoint is publicly accessible and only returns public memory posts with user information and media attachments.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the memory post to retrieve
 *         example: 1
 *     responses:
 *       200:
 *         description: Memory post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Memory post retrieved successfully"
 *                 post:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "My Amazing Birthday Cake"
 *                     description:
 *                       type: string
 *                       example: "This is the beautiful cake I made for my birthday celebration."
 *                     post_type:
 *                       type: string
 *                       example: "memory"
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
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-20T10:00:00Z"
 *                     user:
 *                       type: object
 *                       description: "Complete information about the user who posted this memory"
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         username:
 *                           type: string
 *                           example: "johndoe"
 *                         full_name:
 *                           type: string
 *                           example: "John Doe"
 *                         avatar:
 *                           type: string
 *                           example: "https://example.com/avatar.jpg"
 *                         is_Baker:
 *                           type: boolean
 *                           example: true
 *                           description: "Whether this user is a professional baker"
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-15T08:30:00Z"
 *                           description: "When the user joined the platform"
 *                         address:
 *                           type: string
 *                           example: "123 Baker Street, New York, NY"
 *                           description: "User's address (if shared publicly)"
 *                         phone_number:
 *                           type: string
 *                           example: "+1-555-0123"
 *                           description: "User's phone number (if shared publicly)"
 *                     MemoryPost:
 *                       type: object
 *                       properties:
 *                         event_date:
 *                           type: string
 *                           format: date
 *                           example: "2024-03-20"
 *                         event_type:
 *                           type: string
 *                           example: "Birthday"
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
 *                             example: "https://example.com/cake-image.jpg"
 *                           video_url:
 *                             type: string
 *                             example: null
 *       404:
 *         description: Memory post not found or not publicly accessible
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Memory post not found or not publicly accessible"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving memory post"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.get('/:id', getMemoryPostById);

export default router;
