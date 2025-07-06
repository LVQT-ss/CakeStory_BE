import express from 'express';
import { createMemoryPost, getMemoryPostById, updateMemoryPostById, deleteMemoryPostById, getAllMemoryPosts, getAllMemoryPostsByUserId } from '../controllers/memoryPost.controller.js';
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
 *                         role:
 *                           type: string
 *                           enum: [user, account_staff, complaint_handler, admin, baker]
 *                           example: baker
 *                           description: "User's role in the system"
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

/**
 * @swagger
 * /api/memory-posts/{id}:
 *   put:
 *     tags:
 *       - Memory Posts
 *     summary: Update a memory post by ID
 *     description: Update an existing memory post. Only the post owner or admin can update a memory post. All fields are optional - only provided fields will be updated.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the memory post to update
 *         example: 1
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated: My Amazing Birthday Cake"
 *                 description: New title for the memory post
 *               description:
 *                 type: string
 *                 example: "Updated description of this beautiful cake I made for my birthday celebration!"
 *                 description: New detailed description of the memory
 *               event_date:
 *                 type: string
 *                 format: date
 *                 example: "2024-03-21"
 *                 description: Updated date when the memory/event occurred
 *               event_type:
 *                 type: string
 *                 example: "Birthday Celebration"
 *                 description: Updated type of event or occasion
 *               is_public:
 *                 type: boolean
 *                 example: false
 *                 description: Whether the memory post should be visible to other users
 *               media:
 *                 type: array
 *                 description: Updated array of media attachments (replaces all existing media)
 *                 items:
 *                   type: object
 *                   properties:
 *                     image_url:
 *                       type: string
 *                       example: "https://example.com/updated-cake-image.jpg"
 *                       description: URL of an image
 *                     video_url:
 *                       type: string
 *                       example: "https://example.com/updated-cake-video.mp4"
 *                       description: URL of a video
 *     responses:
 *       200:
 *         description: Memory post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Memory post updated successfully"
 *                 post:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Updated: My Amazing Birthday Cake"
 *                     description:
 *                       type: string
 *                       example: "Updated description of this beautiful cake."
 *                     post_type:
 *                       type: string
 *                       example: "memory"
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     is_public:
 *                       type: boolean
 *                       example: false
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-20T10:00:00Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-21T14:30:00Z"
 *                     user:
 *                       type: object
 *                       description: "Information about the user who posted this memory"
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
 *                     MemoryPost:
 *                       type: object
 *                       properties:
 *                         event_date:
 *                           type: string
 *                           format: date
 *                           example: "2024-03-21"
 *                         event_type:
 *                           type: string
 *                           example: "Birthday Celebration"
 *                     media:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 2
 *                           image_url:
 *                             type: string
 *                             example: "https://example.com/updated-cake-image.jpg"
 *                           video_url:
 *                             type: string
 *                             example: null
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
 *       403:
 *         description: Forbidden - Not authorized to update this post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You can only update your own memory posts"
 *       404:
 *         description: Memory post not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Memory post not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error updating memory post"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.put('/:id', verifyToken, updateMemoryPostById);

/**
 * @swagger
 * /api/memory-posts/{id}:
 *   delete:
 *     tags:
 *       - Memory Posts
 *     summary: Delete a memory post by ID
 *     description: Delete an existing memory post. Only the post owner can delete their own memory post. This action will permanently remove the post and all associated media.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the memory post to delete
 *         example: 1
 *     responses:
 *       200:
 *         description: Memory post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Memory post deleted successfully"
 *                 deletedPost:
 *                   type: object
 *                   description: "Information about the deleted post for confirmation"
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "My Amazing Birthday Cake"
 *                     user:
 *                       type: object
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
 *       403:
 *         description: Forbidden - Only post owner can delete
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You can only delete your own memory posts"
 *       404:
 *         description: Memory post not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Memory post not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error deleting memory post"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.delete('/:id', verifyToken, deleteMemoryPostById);

/**
 * @swagger
 * /api/memory-posts:
 *   get:
 *     tags:
 *       - Memory Posts
 *     summary: Get all public memory posts
 *     description: Retrieve all public memory posts with their associated user information and media attachments
 *     responses:
 *       200:
 *         description: Memory posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Memory posts retrieved successfully"
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: "My Amazing Birthday Cake"
 *                       description:
 *                         type: string
 *                         example: "This is the beautiful cake I made for my birthday celebration."
 *                       post_type:
 *                         type: string
 *                         example: "memory"
 *                       is_public:
 *                         type: boolean
 *                         example: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-20T10:00:00Z"
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           username:
 *                             type: string
 *                             example: "johndoe"
 *                           full_name:
 *                             type: string
 *                             example: "John Doe"
 *                           avatar:
 *                             type: string
 *                             example: "https://example.com/avatar.jpg"
 *                           role:
 *                             type: string
 *                             enum: [user, account_staff, complaint_handler, admin, baker]
 *                             example: baker
 *                       MemoryPost:
 *                         type: object
 *                         properties:
 *                           event_date:
 *                             type: string
 *                             format: date
 *                             example: "2024-03-20"
 *                           event_type:
 *                             type: string
 *                             example: "Birthday"
 *                       media:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             image_url:
 *                               type: string
 *                               example: "https://example.com/cake-image.jpg"
 *                             video_url:
 *                               type: string
 *                               example: null
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving memory posts"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.get('/', getAllMemoryPosts);

/**
 * @swagger
 * /api/memory-posts/user/{userId}:
 *   get:
 *     tags:
 *       - Memory Posts
 *     summary: Get all memory posts of a specific user
 *     description: Retrieve all memory posts created by a specific user, including post details and media attachments
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user whose memory posts to retrieve
 *         example: 1
 *     responses:
 *       200:
 *         description: User memory posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User memory posts retrieved successfully"
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       event_date:
 *                         type: string
 *                         format: date
 *                         example: "2024-03-20"
 *                       event_type:
 *                         type: string
 *                         example: "Birthday"
 *                       Post:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           title:
 *                             type: string
 *                             example: "My Amazing Birthday Cake"
 *                           description:
 *                             type: string
 *                             example: "This is the beautiful cake I made for my birthday celebration."
 *                           post_type:
 *                             type: string
 *                             example: "memory"
 *                           is_public:
 *                             type: boolean
 *                             example: true
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-03-20T10:00:00Z"
 *                           media:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 1
 *                                 image_url:
 *                                   type: string
 *                                   example: "https://example.com/cake-image.jpg"
 *                                 video_url:
 *                                   type: string
 *                                   example: null
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 1
 *                               username:
 *                                 type: string
 *                                 example: "johndoe"
 *                               full_name:
 *                                 type: string
 *                                 example: "John Doe"
 *                               avatar:
 *                                 type: string
 *                                 example: "https://example.com/avatar.jpg"
 *                               role:
 *                                 type: string
 *                                 enum: [user, account_staff, complaint_handler, admin, baker]
 *                                 example: baker
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving user memory posts"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.get('/user/:userId', getAllMemoryPostsByUserId);

export default router;
