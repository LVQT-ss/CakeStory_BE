import express from 'express';
import { createAlbum, createAlbumPost, getAlbumById, getAlbumPostById, getAllAlbums, updateAlbum, updateAlbumPost, getAlbumByUser } from '../controllers/album.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/albums:
 *   get:
 *     tags:
 *       - Albums
 *     summary: Get all albums
 *     description: Retrieve a paginated list of all albums with their posts and media
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
 *         description: Albums retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Albums retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     albums:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: "My Birthday Album"
 *                           description:
 *                             type: string
 *                             example: "Collection of birthday photos"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-03-20T10:00:00Z"
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
 *                                 example: user
 *                           album_posts:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 1
 *                                 name:
 *                                   type: string
 *                                   example: "Birthday Party Photos"
 *                                 description:
 *                                   type: string
 *                                   example: "Photos from the party"
 *                                 post:
 *                                   type: object
 *                                   properties:
 *                                     media:
 *                                       type: array
 *                                       items:
 *                                         type: object
 *                                         properties:
 *                                           id:
 *                                             type: integer
 *                                             example: 1
 *                                           image_url:
 *                                             type: string
 *                                             example: "https://example.com/photo1.jpg"
 *                                           video_url:
 *                                             type: string
 *                                             example: null
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 50
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         hasMore:
 *                           type: boolean
 *                           example: true
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving albums"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.get('/', getAllAlbums);

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
 * /api/albums/{id}:
 *   get:
 *     tags:
 *       - Albums
 *     summary: Get an album by ID
 *     description: Retrieve a specific album and its posts by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the album to retrieve
 *         example: 1
 *     responses:
 *       200:
 *         description: Album retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Album retrieved successfully"
 *                 album:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "My Birthday Album"
 *                     description:
 *                       type: string
 *                       example: "Collection of photos from my birthday celebration"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-20T10:00:00Z"
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
 *                         avatar:
 *                           type: string
 *                           example: "https://example.com/avatar.jpg"
 *                         role:
 *                           type: string
 *                           enum: [user, account_staff, complaint_handler, admin, baker]
 *                           example: baker
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-15T08:30:00Z"
 *                         address:
 *                           type: string
 *                           example: "123 Baker Street, New York, NY"
 *                         phone_number:
 *                           type: string
 *                           example: "+1-555-0123"
 *                     album_posts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: "Birthday Party Photos"
 *                           description:
 *                             type: string
 *                             example: "Photos from the party"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-03-20T10:00:00Z"
 *                           post:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 1
 *                               title:
 *                                 type: string
 *                                 example: "Birthday Party Photos"
 *                               description:
 *                                 type: string
 *                                 example: "Photos from the party"
 *                               is_public:
 *                                 type: boolean
 *                                 example: true
 *                               media:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: integer
 *                                       example: 1
 *                                     image_url:
 *                                       type: string
 *                                       example: "https://example.com/photo1.jpg"
 *                                     video_url:
 *                                       type: string
 *                                       example: null
 *       404:
 *         description: Album not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Album not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving album"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.get('/:id', getAlbumById);

/**
 * @swagger
 * /api/albums/user/{userId}:
 *   get:
 *     tags:
 *       - Albums
 *     summary: Get all albums by user ID
 *     description: Retrieve a paginated list of albums for a specific user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user
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
 *         description: Albums retrieved successfully
 *       404:
 *         description: User or albums not found
 */
router.get('/user/:userId', getAlbumByUser);

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

/**
 * @swagger
 * /api/albums/posts/{id}:
 *   get:
 *     tags:
 *       - Albums
 *     summary: Get an album post by ID
 *     description: Retrieve a specific album post with its media and album information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the album post to retrieve
 *         example: 1
 *     responses:
 *       200:
 *         description: Album post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Album post retrieved successfully"
 *                 albumPost:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Birthday Party Photos"
 *                     description:
 *                       type: string
 *                       example: "Photos from the party"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-20T10:00:00Z"
 *                     Album:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: "My Birthday Album"
 *                         description:
 *                           type: string
 *                           example: "Collection of birthday photos"
 *                         user:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             username:
 *                               type: string
 *                               example: "johndoe"
 *                             full_name:
 *                               type: string
 *                               example: "John Doe"
 *                             avatar:
 *                               type: string
 *                               example: "https://example.com/avatar.jpg"
 *                             role:
 *                               type: string
 *                               enum: [user, account_staff, complaint_handler, admin, baker]
 *                               example: user
 *                             created_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-01-15T08:30:00Z"
 *                     Post:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         title:
 *                           type: string
 *                           example: "Birthday Party Photos"
 *                         description:
 *                           type: string
 *                           example: "Photos from the party"
 *                         is_public:
 *                           type: boolean
 *                           example: true
 *                         media:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 1
 *                               image_url:
 *                                 type: string
 *                                 example: "https://example.com/photo1.jpg"
 *                               video_url:
 *                                 type: string
 *                                 example: null
 *       404:
 *         description: Album post not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Album post not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving album post"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.get('/posts/:id', getAlbumPostById);

/**
 * @swagger
 * /api/albums/{id}:
 *   put:
 *     tags:
 *       - Albums
 *     summary: Update an album
 *     description: Update an album's details. Only the album owner can update it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the album to update
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
 *                 example: "Updated Album Name"
 *               description:
 *                 type: string
 *                 example: "Updated album description"
 *     responses:
 *       200:
 *         description: Album updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Album updated successfully"
 *                 album:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Updated Album Name"
 *                     description:
 *                       type: string
 *                       example: "Updated album description"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         username:
 *                           type: string
 *                         full_name:
 *                           type: string
 *                         avatar:
 *                           type: string
 *                         role:
 *                           type: string
 *                     album_posts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           post:
 *                             type: object
 *                             properties:
 *                               media:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: integer
 *                                     image_url:
 *                                       type: string
 *                                     video_url:
 *                                       type: string
 *       400:
 *         description: Bad request - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Name is required"
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error updating album"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.put('/:id', verifyToken, updateAlbum);

/**
 * @swagger
 * /api/albums/posts/{id}:
 *   put:
 *     tags:
 *       - Albums
 *     summary: Update an album post
 *     description: Update an album post's details including post and media. Only the post owner can update it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the album post to update
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
 *                 example: "Updated Post Title"
 *               description:
 *                 type: string
 *                 example: "Updated post description"
 *               is_public:
 *                 type: boolean
 *                 example: true
 *               media:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     image_url:
 *                       type: string
 *                       example: "https://example.com/new-photo.jpg"
 *                     video_url:
 *                       type: string
 *                       example: "https://example.com/new-video.mp4"
 *     responses:
 *       200:
 *         description: Album post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Album post updated successfully"
 *                 albumPost:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Updated Post Title"
 *                     description:
 *                       type: string
 *                       example: "Updated post description"
 *                     Album:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: "Album Name"
 *                         user:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             username:
 *                               type: string
 *                             full_name:
 *                               type: string
 *                             avatar:
 *                               type: string
 *                             role:
 *                               type: string
 *                     Post:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         title:
 *                           type: string
 *                           example: "Updated Post Title"
 *                         description:
 *                           type: string
 *                           example: "Updated post description"
 *                         is_public:
 *                           type: boolean
 *                           example: true
 *                         media:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 1
 *                               image_url:
 *                                 type: string
 *                                 example: "https://example.com/new-photo.jpg"
 *                               video_url:
 *                                 type: string
 *                                 example: null
 *       400:
 *         description: Bad request - Missing required fields
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
 *       404:
 *         description: Album post not found or access denied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Album post not found or access denied"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error updating album post"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.put('/posts/:id', verifyToken, updateAlbumPost);

export default router;
