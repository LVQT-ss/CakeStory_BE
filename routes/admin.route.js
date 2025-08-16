import express from 'express';
import { getAllUsers, getUserById, deleteUser, getAllUsersByPremium } from '../controllers/admin.controller.js';
import { verifyAdmin, verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all users
 *     description: Retrieve all users (admin only, excludes password)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                       email:
 *                         type: string
 *                         example: john.doe@example.com
 *                       full_name:
 *                         type: string
 *                         example: John Doe
 *                       avatar:
 *                         type: string
 *                         example: https://example.com/avatar.jpg
 *                       firebase_uid:
 *                         type: string
 *                         example: firebase_uid_123
 *                       role:
 *                         type: string
 *                         enum: [user, account_staff, complaint_handler, admin, baker]
 *                         example: baker
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Server error
 */
router.get('/users', verifyToken, verifyAdmin, getAllUsers);
// đang bỏ premium
/**
 * @swagger
 * /api/admin/users/premium:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get users by premium status
 *     description: Retrieve all users who are premium (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Premium users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Premium users retrieved successfully
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       username:
 *                         type: string
 *                       email:
 *                         type: string
 *                       isPremium:
 *                         type: boolean
 *                         example: true
 *       404:
 *         description: No premium users found
 *       500:
 *         description: Server error
 */
router.get('/users/premium', verifyToken, verifyAdmin, getAllUsersByPremium);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get user by ID
 *     description: Retrieve a specific user by ID (admin only, excludes password)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User retrieved successfully
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
 *                     avatar:
 *                       type: string
 *                       example: https://example.com/avatar.jpg
 *                     firebase_uid:
 *                       type: string
 *                       example: firebase_uid_123
 *                     role:
 *                       type: string
 *                       enum: [user, account_staff, complaint_handler, admin, baker]
 *                       example: baker
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/users/:id', verifyToken, verifyAdmin, getUserById);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Deactivate user
 *     description: Deactivate a user by setting isActive to false (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to deactivate
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deactivated successfully
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
 *                     isActive:
 *                       type: boolean
 *                       example: false
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/users/:id', verifyToken, verifyAdmin, deleteUser);

export default router;