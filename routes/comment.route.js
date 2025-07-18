import express from 'express';
import { createComment, getCommentsByPostId, updateComment, deleteComment } from '../controllers/comment.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/comments/post/{post_id}:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Create a new comment on a post
 *     description: Add a new comment to a specific post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the post to comment on
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "This cake looks amazing!"
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment created successfully"
 *                 comment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     content:
 *                       type: string
 *                       example: "This cake looks amazing!"
 *                     post_id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-20T10:00:00Z"
 *                     User:
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
 *       400:
 *         description: Bad request - Missing content
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.post('/post/:post_id', verifyToken, createComment);

/**
 * @swagger
 * /api/comments/post/{post_id}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get all comments for a post
 *     description: Retrieve all comments for a specific post with user information
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the post to get comments for
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comments retrieved successfully"
 *                 comments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       content:
 *                         type: string
 *                         example: "This cake looks amazing!"
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
 *                 total_comments:
 *                   type: integer
 *                   example: 5
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.get('/post/:post_id', getCommentsByPostId);

/**
 * @swagger
 * /api/comments/{comment_id}:
 *   put:
 *     tags:
 *       - Comments
 *     summary: Update a comment
 *     description: Update the content of a specific comment (only by comment owner)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comment_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the comment to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Updated comment content"
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       400:
 *         description: Bad request - Missing content
 *       403:
 *         description: Forbidden - Not comment owner
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
 */
router.put('/:comment_id', verifyToken, updateComment);

/**
 * @swagger
 * /api/comments/{comment_id}:
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Delete a comment
 *     description: Delete a specific comment (only by comment owner)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comment_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the comment to delete
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       403:
 *         description: Forbidden - Not comment owner
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
 */
router.delete('/:comment_id', verifyToken, deleteComment);

export default router; 