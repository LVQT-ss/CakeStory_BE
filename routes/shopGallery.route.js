import express from 'express';
import {
  createShopGallery,
  updateShopGallery,
  deleteShopGallery,
  getAllShopGallery,
  getShopGalleryById,
  getShopGalleryByShopId
} from '../controllers/shop_gallery.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ShopGallery
 *   description: APIs for managing shop gallery images
 */

/**
 * @swagger
 * /api/shop-gallery:
 *   get:
 *     tags: [ShopGallery]
 *     summary: Get all shop galleries (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of shop gallery entries
 *       500:
 *         description: Server error
 */
router.get('/', verifyToken, getAllShopGallery);

/**
 * @swagger
 * /api/shop-gallery/{id}:
 *   get:
 *     tags: [ShopGallery]
 *     summary: Get shop gallery item by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ShopGallery ID
 *     responses:
 *       200:
 *         description: Shop gallery item found
 *       404:
 *         description: Not found
 */
router.get('/:id', verifyToken, getShopGalleryById);

/**
 * @swagger
 * /api/shop-gallery/shop/{shop_id}:
 *   get:
 *     tags: [ShopGallery]
 *     summary: Get all gallery images for a specific shop
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shop ID
 *     responses:
 *       200:
 *         description: List of gallery images
 *       404:
 *         description: No images found
 */
router.get('/shop/:shop_id', verifyToken, getShopGalleryByShopId);

/**
 * @swagger
 * /api/shop-gallery:
 *   post:
 *     tags: [ShopGallery]
 *     summary: Add a new image to shop gallery
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shop_id
 *               - image
 *             properties:
 *               shop_id:
 *                 type: integer
 *               title:
 *                 type: string
 *               images:
 *                 type: string
 *                 description: Image URL
 *     responses:
 *       201:
 *         description: Shop gallery item created
 *       500:
 *         description: Server error
 */
router.post('/', verifyToken, createShopGallery);

/**
 * @swagger
 * /api/shop-gallery/{id}:
 *   put:
 *     tags: [ShopGallery]
 *     summary: Update shop gallery item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ShopGallery ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *                 description: Image URL
 *     responses:
 *       200:
 *         description: Shop gallery item updated
 *       404:
 *         description: Not found
 */
router.put('/:id', verifyToken, updateShopGallery);

/**
 * @swagger
 * /api/shop-gallery/{id}:
 *   delete:
 *     tags: [ShopGallery]
 *     summary: Delete shop gallery item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ShopGallery ID
 *     responses:
 *       200:
 *         description: Shop gallery item deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', verifyToken, deleteShopGallery);

export default router;
