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
 * /api/wallet/payos-webhook:
 *   get:
 *     tags:
 *       - PayOS Payment System
 *     summary: 🧪 PayOS webhook test endpoint
 *     description: |
 *       Test endpoint to verify webhook connectivity. PayOS uses this to test webhook URL validity.
 *       
 *       **This is automatically called by PayOS during webhook setup**
 *     responses:
 *       200:
 *         description: Webhook endpoint is active
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
 *                   example: "PayOS Webhook endpoint is active"
 *   post:
 *     tags:
 *       - PayOS Payment System
 *     summary: 🔗 PayOS webhook endpoint (AUTO)
 *     description: |
 *       Handles PayOS webhook notifications for payment status updates. This endpoint is called automatically by PayOS when payment status changes.
 *       
 *       **Webhook Events:**
 *       - PAID: Payment completed successfully → Balance added to user wallet
 *       - CANCELLED: Payment cancelled → Transaction marked as cancelled
 *       - PENDING: Payment in progress → No action taken
 *       
 *       **Security Features:**
 *       - Webhook signature verification using HMAC SHA256
 *       - Checksum validation against PayOS checksum key
 *       - Duplicate payment prevention (idempotency)
 *       - Database transaction for data consistency
 *       - Amount verification against original transaction
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
 *                 required:
 *                   - orderCode
 *                   - status
 *                   - amount
 *                 properties:
 *                   orderCode:
 *                     type: integer
 *                     description: Transaction ID in our database (DepositRecords.id)
 *                     example: 12345
 *                   status:
 *                     type: string
 *                     enum: [PAID, CANCELLED, PENDING, FAILED]
 *                     description: Payment status from PayOS
 *                     example: "PAID"
 *                   amount:
 *                     type: integer
 *                     description: Payment amount in VND
 *                     example: 200000
 *                   description:
 *                     type: string
 *                     description: Payment description
 *                     example: "Nap 200000 VND"
 *                   transactionDateTime:
 *                     type: string
 *                     format: date-time
 *                     description: Transaction timestamp
 *                     example: "2024-01-15T10:30:00Z"
 *     parameters:
 *       - in: header
 *         name: x-payos-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: PayOS webhook signature for verification (HMAC-SHA256)
 *         example: "3c4b5a2d8e9f1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z"
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
 *                     payment_success:
 *                       summary: Payment completed
 *                       value: "Payment processed successfully"
 *                     payment_cancelled:
 *                       summary: Payment cancelled
 *                       value: "Payment status updated to cancelled"
 *                     already_processed:
 *                       summary: Already processed
 *                       value: "Payment already processed"
 *                     webhook_test:
 *                       summary: Webhook validation
 *                       value: "Webhook received successfully"
 *       401:
 *         description: Invalid webhook signature
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
 *                   example: "Invalid signature"
 *       404:
 *         description: Transaction not found in database
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
 *                   example: "Deposit record not found for order 12345"
 *       500:
 *         description: Internal server error during webhook processing
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
 *                   examples:
 *                     database_error:
 *                       summary: Database transaction failed
 *                       value: "Failed to process webhook"
 *                     amount_mismatch:
 *                       summary: Amount verification failed
 *                       value: "Amount mismatch: expected 200000, got 150000"
 *                     wallet_not_found:
 *                       summary: User wallet missing
 *                       value: "Wallet not found for user 123"
 */

// Route setup
router.get('/payos-webhook', payOSWebhook);   // For PayOS webhook testing
router.post('/payos-webhook', payOSWebhook);  // For actual webhook notifications


export default router;