import express from 'express';
import { updateProfile } from '../controllers/user.controller.js';

const router = express.Router();

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