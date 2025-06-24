import express from 'express';
import { likePost } from '../controllers/like.controller.js';
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

export default router;
