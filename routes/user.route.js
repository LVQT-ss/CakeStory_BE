import express from 'express';
import { updateProfile, viewProfile, followUser, unfollowUser } from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/users/follow/{id}:
 *   post:
 *     tags:
 *       - User Profile
 *     summary: Follow a user
 *     description: Follow another user to stay updated with their activities
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to follow
 *     responses:
 *       200:
 *         description: Successfully followed user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully followed user
 *                 isFollowing:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad Request - Cannot follow yourself or already following
 *       404:
 *         description: User to follow not found
 *       500:
 *         description: Server error
 */
router.post('/follow/:id', verifyToken, followUser);

/**
 * @swagger
 * /api/users/follow/{id}:
 *   delete:
 *     tags:
 *       - User Profile
 *     summary: Unfollow a user
 *     description: Unfollow a user you are currently following
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to unfollow
 *     responses:
 *       200:
 *         description: Successfully unfollowed user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully unfollowed user
 *                 isFollowing:
 *                   type: boolean
 *                   example: false
 *       400:
 *         description: Bad Request - Cannot unfollow yourself or not following the user
 *       404:
 *         description: User to unfollow not found
 *       500:
 *         description: Server error
 */
router.delete('/follow/:id', verifyToken, unfollowUser);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - User Profile
 *     summary: Get user profile by ID
 *     description: Retrieve a user's profile information by their ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *                     full_name:
 *                       type: string
 *                       example: John Doe
 *                     address:
 *                       type: string
 *                       example: 123 Main Street, City, Country
 *                     phone_number:
 *                       type: string
 *                       example: "+1234567890"
 *                     avatar:
 *                       type: string
 *                       example: https://example.com/avatar.jpg
 *                     is_Baker:
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
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:id', viewProfile);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags:
 *       - User Profile
 *     summary: Update user profile
 *     description: Update a user's profile information by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               full_name:
 *                 type: string
 *                 example: John Doe
 *               address:
 *                 type: string
 *                 example: 123 Main Street, City, Country
 *               phone_number:
 *                 type: string
 *                 example: "+1234567890"
 *               avatar:
 *                 type: string
 *                 example: https://example.com/avatar.jpg
 *               is_Baker:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *                     full_name:
 *                       type: string
 *                       example: John Doe
 *                     address:
 *                       type: string
 *                       example: 123 Main Street, City, Country
 *                     phone_number:
 *                       type: string
 *                       example: "+1234567890"
 *                     avatar:
 *                       type: string
 *                       example: https://example.com/avatar.jpg
 *                     is_Baker:
 *                       type: boolean
 *                       example: true
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/:id', updateProfile);

export default router;