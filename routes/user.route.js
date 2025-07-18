import express from 'express';
import { updateProfile, viewProfile, followUser, unfollowUser, getAllUsers, getFollowers, getFollowing } from '../controllers/user.controller.js';
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
 * /api/users/{id}/followers:
 *   get:
 *     tags:
 *       - User Profile
 *     summary: Get user's followers
 *     description: Retrieve all users who are following the specified user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user whose followers to retrieve
 *     responses:
 *       200:
 *         description: Followers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Followers retrieved successfully
 *                 followers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       username:
 *                         type: string
 *                         example: johndoe
 *                       full_name:
 *                         type: string
 *                         example: John Doe
 *                       avatar:
 *                         type: string
 *                         example: https://example.com/avatar.jpg
 *                       role:
 *                         type: string
 *                         enum: [user, account_staff, complaint_handler, admin, baker]
 *                         example: baker
 *                 totalFollowers:
 *                   type: integer
 *                   example: 15
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:id/followers', getFollowers);

/**
 * @swagger
 * /api/users/{id}/following:
 *   get:
 *     tags:
 *       - User Profile
 *     summary: Get users that a user follows
 *     description: Retrieve all users that the specified user is following
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user whose following list to retrieve
 *     responses:
 *       200:
 *         description: Following list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Following list retrieved successfully
 *                 following:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       username:
 *                         type: string
 *                         example: johndoe
 *                       full_name:
 *                         type: string
 *                         example: John Doe
 *                       avatar:
 *                         type: string
 *                         example: https://example.com/avatar.jpg
 *                       role:
 *                         type: string
 *                         enum: [user, account_staff, complaint_handler, admin, baker]
 *                         example: baker
 *                 totalFollowing:
 *                   type: integer
 *                   example: 10
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:id/following', getFollowing);

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
 *                     role:
 *                       type: string
 *                       enum: [user, account_staff, complaint_handler, admin, baker]
 *                       example: baker
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
 *               role:
 *                 type: string
 *                 enum: [user, account_staff, complaint_handler, admin, baker]
 *                 example: baker
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
 *                     role:
 *                       type: string
 *                       enum: [user, account_staff, complaint_handler, admin, baker]
 *                       example: baker
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/:id', updateProfile);

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - User Profile
 *     summary: Get all active users
 *     description: Retrieve all active users in the system (where is_active = true)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Users retrieved successfully
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       username:
 *                         type: string
 *                         example: johndoe
 *                       full_name:
 *                         type: string
 *                         example: John Doe
 *                       address:
 *                         type: string
 *                         example: 123 Main Street, City, Country
 *                       phone_number:
 *                         type: string
 *                         example: "+1234567890"
 *                       avatar:
 *                         type: string
 *                         example: https://example.com/avatar.jpg
 *                       role:
 *                         type: string
 *                         enum: [user, account_staff, complaint_handler, admin]
 *                         example: user
 *                       is_active:
 *                         type: boolean
 *                         example: true
 *                       isPremium:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-20T10:00:00Z"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-20T10:00:00Z"
 *       500:
 *         description: Server error
 */
router.get('/', getAllUsers);

export default router;