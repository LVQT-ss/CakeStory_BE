import express from 'express';
import {
  createMarketplacePost,
  getAllMarketplacePosts,
  getMarketplacePostById,
  updateMarketplacePost,
  deleteMarketplacePost
} from '../controllers/marketplace_post.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Marketplace
 *   description: APIs for managing marketplace posts
 */

/**
 * @swagger
 * /api/marketplace-posts:
 *   post:
 *     tags: [Marketplace]
 *     summary: Create a new marketplace post
 *     description: Create a new marketplace post under an active shop. 
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
 *               - cakeSizes
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               tier:            
 *                 type: string
 *                 example: basic
 *               available:
 *                 type: boolean
 *               expiry_date:
 *                 type: string
 *                 format: date
 *               is_public:
 *                 type: boolean
 *               media:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     image_url:
 *                       type: string
 *                     video_url:
 *                       type: string
 *               cakeSizes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [size, price]
 *                   properties:
 *                     size:
 *                       type: string
 *                     price:
 *                       type: number
 *     responses:
 *       201:
 *         description: Marketplace post created successfully
 *       403:
 *         description: No active shop found
 *       500:
 *         description: Server error
 */
router.post('/', verifyToken, createMarketplacePost);

/**
 * @swagger
 * /api/marketplace-posts:
 *   get:
 *     tags: [Marketplace]
 *     summary: Get all marketplace posts
 *     description: Retrieve all marketplace posts along with their media, shop info, and cake sizes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Marketplace posts retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', verifyToken, getAllMarketplacePosts);

/**
 * @swagger
 * /api/marketplace-posts/{id}:
 *   get:
 *     tags: [Marketplace]
 *     summary: Get a marketplace post by ID
 *     description: Retrieve details of a specific marketplace post including shop, media, and cake sizes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the marketplace post
 *     responses:
 *       200:
 *         description: Marketplace post retrieved successfully
 *       404:
 *         description: Marketplace post not found
 *       500:
 *         description: Server error
 */
router.get('/:id', verifyToken, getMarketplacePostById);

/**
 * @swagger
 * /api/marketplace-posts/{id}:
 *   put:
 *     tags: [Marketplace]
 *     summary: Update a marketplace post
 *     description: Update the details of a specific marketplace post (does not update cakeSizes yet)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the marketplace post to update
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               tier:             
 *                 type: string
 *                 example: premium
 *               available:
 *                 type: boolean
 *               expiry_date:
 *                 type: string
 *                 format: date
 *               is_public:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Marketplace post updated successfully
 *       404:
 *         description: Marketplace post not found
 *       500:
 *         description: Server error
 */
router.put('/:id', verifyToken, updateMarketplacePost);

/**
 * @swagger
 * /api/marketplace-posts/{id}:
 *   delete:
 *     tags: [Marketplace]
 *     summary: Delete a marketplace post
 *     description: Delete a specific marketplace post by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the marketplace post to delete
 *     responses:
 *       200:
 *         description: Marketplace post deleted successfully
 *       404:
 *         description: Marketplace post not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', verifyToken, deleteMarketplacePost);

export default router;
