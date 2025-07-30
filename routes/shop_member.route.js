import express from 'express';

import {
  createShopMember,
  getMyShopMembers,
  deleteShopMember,
  updateShopMember,
  getAllShopMembers 
} from '../controllers/shop_member.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ShopMember
 *   description: API for managing shop members
 */

/**
 * @swagger
 * /api/shop-members:
 *   post:
 *     tags: [ShopMember]
 *     summary: Create a new shop member
 *     description: Must be called by the shop owner. The new member will be inactive by default.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newUserId
 *             properties:
 *               newUserId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Shop member created successfully
 *       400:
 *         description: Member already exists
 *       403:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', verifyToken, createShopMember);

/**
 * @swagger
 * /api/shop-members/all:
 *   get:
 *     tags: [ShopMember]
 *     summary: Get all shop members in the system
 *     description: Retrieve all shop members with their user info
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All shop members retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 */
router.get('/all', verifyToken, getAllShopMembers);


/**
 * @swagger
 * /api/shop-members:
 *   get:
 *     tags: [ShopMember]
 *     summary: Get all members in your shop
 *     description: Must be the shop owner to view members
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Shop members retrieved
 *       403:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', verifyToken, getMyShopMembers);

/**
 * @swagger
 * /api/shop-members/{userIdToRemove}:
 *   delete:
 *     tags: [ShopMember]
 *     summary: Delete a shop member
 *     description: Only admins can delete members (except themselves)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userIdToRemove
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       400:
 *         description: Cannot remove yourself
 *       403:
 *         description: Not an admin
 *       404:
 *         description: Member not found
 *       500:
 *         description: Server error
 */
router.delete('/:userIdToRemove', verifyToken, deleteShopMember);

/**
 * @swagger
 * /api/shop-members/activate:
 *   put:
 *     tags: [ShopMember]
 *     summary: Activate your membership
 *     description: Only non-admins can activate themselves
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Membership activated
 *       400:
 *         description: Already active
 *       403:
 *         description: Admins cannot activate this way
 *       500:
 *         description: Server error
 */
router.put('/activate', verifyToken, updateShopMember);

export default router;
