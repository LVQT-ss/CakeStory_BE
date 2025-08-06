import express from 'express';
import {
    createCakeDesign,
    getCakeDesigns
} from '../controllers/cakeDesign.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';
const router = express.Router();

/**
 * @swagger
 * /api/cake-designs/create:
 *   post:
 *     tags:
 *       - Cake Design
 *     summary: Create a new cake design
 *     description: Create a new cake design with user association
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - design_image
 *             properties:
 *               description:
 *                 type: string
 *                 description: Description of the cake design
 *                 example: "A beautiful chocolate cake with vanilla frosting and sprinkles"
 *                 nullable: true
 *               design_image:
 *                 type: string
 *                 description: URL or base64 string of the design image
 *                 example: "https://example.com/cake-design.jpg"
 *               is_public:
 *                 type: boolean
 *                 description: Whether the design is public or private
 *                 default: true
 *                 example: true
 *               ai_generated:
 *                 type: string
 *                 description: AI generation method or prompt used (null if not AI generated)
 *                 example: "DALL-E 3: A chocolate cake with vanilla frosting"
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Cake design created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cake design created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     description:
 *                       type: string
 *                       nullable: true
 *                       example: "A beautiful chocolate cake with vanilla frosting and sprinkles"
 *                     design_image:
 *                       type: string
 *                       example: "https://example.com/cake-design.jpg"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *                     is_public:
 *                       type: boolean
 *                       example: true
 *                     ai_generated:
 *                       type: string
 *                       nullable: true
 *                       example: "DALL-E 3: A chocolate cake with vanilla frosting"
 *       400:
 *         description: Bad Request - Missing required fields
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
 *                   example: "design_image is required"
 *       404:
 *         description: Not Found - User not found
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
 *                   example: "User not found"
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
 *         description: Internal Server Error
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
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.post('/create', verifyToken, createCakeDesign);

/**
 * @swagger
 * /api/cake-designs:
 *   get:
 *     tags:
 *       - Cake Design
 *     summary: Get all cake designs
 *     description: Retrieve a list of cake designs (public designs or user's own designs)
 *     security:
 *       - bearerAuth: []
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
 *       - in: query
 *         name: is_public
 *         schema:
 *           type: boolean
 *         description: Filter by public status
 *       - in: query
 *         name: ai_generated
 *         schema:
 *           type: string
 *         description: Filter by AI generation status ('true' for AI generated, 'false' for not AI generated, or specific AI method)
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by specific user ID
 *     responses:
 *       200:
 *         description: Cake designs fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cake designs fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     cakeDesigns:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           user_id:
 *                             type: integer
 *                             example: 1
 *                           description:
 *                             type: string
 *                             example: "Beautiful wedding cake design"
 *                           design_image:
 *                             type: string
 *                             example: "https://example.com/cake1.jpg"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T10:30:00.000Z"
 *                           is_public:
 *                             type: boolean
 *                             example: true
 *                           ai_generated:
 *                             type: string
 *                             nullable: true
 *                             example: "DALL-E 3: A chocolate cake with vanilla frosting"
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 1
 *                               username:
 *                                 type: string
 *                                 example: "john_doe"
 *                               full_name:
 *                                 type: string
 *                                 example: "John Doe"
 *                               avatar:
 *                                 type: string
 *                                 example: "https://example.com/avatar.jpg"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current_page:
 *                           type: integer
 *                           example: 1
 *                         total_pages:
 *                           type: integer
 *                           example: 5
 *                         total_items:
 *                           type: integer
 *                           example: 50
 *                         items_per_page:
 *                           type: integer
 *                           example: 10
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
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.get('/', verifyToken, getCakeDesigns);

export default router;