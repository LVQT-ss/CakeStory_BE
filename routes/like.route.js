import express from 'express';
import { likePost, getLikesByPostId } from '../controllers/like.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/likes/post/{post_id}:
 *   post:
 *     tags:
 *       - Likes
 *     summary: Like or unlike a post
 *     description: Toggle like status for a post. If the post is already liked, it will be unliked.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the post to like/unlike
 *     responses:
 *       200:
 *         description: Post unliked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post unliked successfully"
 *                 liked:
 *                   type: boolean
 *                   example: false
 *       201:
 *         description: Post liked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post liked successfully"
 *                 liked:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.post('/post/:post_id', verifyToken, likePost);

/**
 * @swagger
 * /api/likes/post/{post_id}:
 *   get:
 *     tags:
 *       - Likes
 *     summary: Get all likes for a post
 *     description: Retrieve all users who liked a specific post
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the post to get likes for
 *     responses:
 *       200:
 *         description: Post likes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post likes retrieved successfully"
 *                 likes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       post_id:
 *                         type: integer
 *                         example: 1
 *                       user_id:
 *                         type: integer
 *                         example: 1
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-20T10:00:00Z"
 *                       User:
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
 *                 total_likes:
 *                   type: integer
 *                   example: 5
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.get('/post/:post_id', getLikesByPostId);

export default router;
