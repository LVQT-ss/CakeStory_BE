import express from 'express';
import {
    register,
    login,
    changePassword,
    verifyEmail
    // requestPasswordReset,
    // resetPassword,
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *     - Auth Controller
 *     summary: Register a new user
 *     description: Creates a new customer account in the system with Firebase Auth integration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - full_name
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: Must be at least 6 characters with at least one uppercase letter, one lowercase letter, and one number
 *                 example: Password123
 *               full_name:
 *                 type: string
 *                 example: John Doe
 *               avatar:
 *                 type: string
 *                 example: https://example.com/avatar.jpg
 *                 nullable: true
 *                 description: Avatar image URL as string
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User successfully registered!
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
 *                       example: johndoe@example.com
 *                     full_name:
 *                       type: string
 *                       example: John Doe
 *                     avatar:
 *                       type: string
 *                       nullable: true
 *                       example: https://example.com/avatar.jpg
 *                     firebase_uid:
 *                       type: string
 *                       example: firebase-uid-string
 *                     role:
 *                       type: string
 *                       enum: [user, account_staff, complaint_handler, admin, baker]
 *                       example: user
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                 firebaseUid:
 *                   type: string
 *                   example: firebase-uid-string
 *       400:
 *         description: Bad Request - Missing or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please provide all required fields or Input data exceeds allowed length.
 *       409:
 *         description: Conflict - Username or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Username or email already exists. Please choose a different one.
 *       500:
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Registration failed
 *                 error:
 *                   type: string
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *     - Auth Controller
 *     summary: Log in a user
 *     description: Authenticates a user with Firebase Auth and returns a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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
 *                       example: johndoe@example.com
 *                     full_name:
 *                       type: string
 *                       example: John Doe
 *                     avatar:
 *                       type: string
 *                       nullable: true
 *                       example: https://example.com/avatar.jpg
 *                     firebase_uid:
 *                       type: string
 *                       example: firebase-uid-string
 *                     role:
 *                       type: string
 *                       enum: [user, account_staff, complaint_handler, admin, baker]
 *                       example: user
 *                 firebaseUid:
 *                   type: string
 *                   example: firebase-uid-string
 *       400:
 *         description: Bad Request - Missing input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email and password are required
 *       401:
 *         description: Unauthorized - Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid email or password
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 *                 error:
 *                   type: string
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     tags:
 *     - Auth Controller
 *     summary: Change user password
 *     description: Allows authenticated users to change their password by providing current password and new password. Updates the password in the PostgreSQL database.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: User's current password for verification
 *                 example: "OldPassword123"
 *               newPassword:
 *                 type: string
 *                 description: New password (must be at least 6 characters)
 *                 example: "NewPassword456"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *       400:
 *         description: Bad Request - Missing fields or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     missing_fields:
 *                       value: "Current password and new password are required"
 *                     weak_password:
 *                       value: "New password must be at least 6 characters long"
 *                     same_password:
 *                       value: "New password must be different from current password"
 *       401:
 *         description: Unauthorized - Invalid current password or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     wrong_password:
 *                       value: "Current password is incorrect"
 *                     no_token:
 *                       value: "Access denied. No token provided."
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
 *                   example: "Error changing password"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.put('/change-password', verifyToken, changePassword);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verify user email address
 *     tags:
 *     - Auth Controller
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email address to verify
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email verified successfully"
 *       400:
 *         description: Invalid or missing email parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email parameter is required"
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
 */
router.get('/verify', verifyEmail);

export default router;