import express from 'express';
import { verifyToken } from '../middleware/verifyUser.js';
import { walletDeposit, payOSWebhook } from '../controllers/wallet.controller.js';
const router = express.Router();

/**
 * @swagger
 * /api/wallet/deposit:
 *   post:
 *     summary: Create a new wallet deposit request
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to deposit (in VND)
 *                 example: 100000
 *     responses:
 *       200:
 *         description: Deposit request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payment link generated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentUrl:
 *                       type: string
 *                       description: URL to complete payment
 *                       example: https://payos.vn/payment/...
 *                     depositCode:
 *                       type: string
 *                       description: Unique deposit reference code
 *                       example: DEP1234567890123
 *                     amount:
 *                       type: number
 *                       description: Amount to be deposited
 *                       example: 100000
 *       400:
 *         description: Invalid amount
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid amount. Amount must be greater than 0
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post('/deposit', verifyToken, walletDeposit);

/**
 * @swagger
 * /api/transactions/payos-webhook:
 *   post:
 *     tags:
 *       - PayOS Payment System
 *     summary: 🔗 PayOS webhook endpoint (AUTO)
 *     description: |
 *       Handles PayOS webhook notifications for payment status updates. This endpoint is called automatically by PayOS when payment status changes.
 *       
 *       **Webhook Events:**
 *       - PAID: Payment completed successfully → Coins added to user
 *       - CANCELLED: Payment cancelled → Transaction marked as failed
 *       - PENDING: Payment in progress → No action taken
 *       
 *       **Security:**
 *       - Webhook signature verification using HMAC SHA256
 *       - Checksum validation against PayOS checksum key
 *       - Duplicate payment prevention
 *       
 *       **This endpoint is for PayOS use only - not for manual testing**
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *                 properties:
 *                   orderCode:
 *                     type: integer
 *                     description: Transaction ID in our system
 *                     example: 12345
 *                   status:
 *                     type: string
 *                     enum: [PAID, CANCELLED, PENDING]
 *                     description: Payment status from PayOS
 *                     example: "PAID"
 *                   amount:
 *                     type: integer
 *                     description: Payment amount
 *                     example: 200000
 *     parameters:
 *       - in: header
 *         name: x-payos-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: PayOS webhook signature for verification
 *     responses:
 *       200:
 *         description: Webhook processed successfully
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
 *                   examples:
 *                     success:
 *                       value: "Payment processed successfully"
 *                     cancelled:
 *                       value: "Payment cancelled"
 *       400:
 *         description: Invalid webhook signature or data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Support both GET (testing) and POST (actual webhook)
router.post('/payos-webhook', payOSWebhook);


export default router;