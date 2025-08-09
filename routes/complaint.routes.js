import express from 'express';
import {
  createComplaint,
  updateComplaint,
  approveComplaint,
  rejectComplaint
} from '../controllers/complaint.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Complaint
 *   description: APIs for managing complaints about cake orders
 */

/**
 * @swagger
 * /api/complaints:
 *   post:
 *     tags: [Complaint]
 *     summary: Create a new complaint for an order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *               - reason
 *             properties:
 *               order_id:
 *                 type: integer
 *               reason:
 *                 type: string
 *               evidence_images:
 *                 type: string
 *                 description: Comma-separated URLs or image references
 *     responses:
 *       201:
 *         description: Complaint created successfully
 *       404:
 *         description: Order not found or not yours
 *       500:
 *         description: Server error
 */
router.post('/', verifyToken, createComplaint);

/**
 * @swagger
 * /api/complaints/{id}:
 *   put:
 *     tags: [Complaint]
 *     summary: Update complaint admin note and processing info
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Complaint ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               admin_note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Complaint updated successfully
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Server error
 */
router.put('/:id', verifyToken, updateComplaint);

/**
 * @swagger
 * /api/complaints/{id}/approve:
 *   put:
 *     tags: [Complaint]
 *     summary: Approve complaint and cancel related order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Complaint ID
 *     responses:
 *       200:
 *         description: Complaint approved and order cancelled
 *       404:
 *         description: Complaint or order not found
 *       500:
 *         description: Server error
 */
router.put('/:id/approve', verifyToken, approveComplaint);

/**
 * @swagger
 * /api/complaints/{id}/reject:
 *   put:
 *     tags: [Complaint]
 *     summary: Reject complaint and mark related order as completed
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Complaint ID
 *     responses:
 *       200:
 *         description: Complaint rejected and order marked as completed
 *       404:
 *         description: Complaint or order not found
 *       500:
 *         description: Server error
 */
router.put('/:id/reject', verifyToken, rejectComplaint);

export default router;
