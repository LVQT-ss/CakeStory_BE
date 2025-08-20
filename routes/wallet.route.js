import express from 'express';
import { verifyToken, verifyAdmin, verifyStaff } from '../middleware/verifyUser.js';
import {
    walletDeposit,
    payOSWebhook,
    walletGetBalance,
    walletGetDepositHistoryUser,
    walletGetDepositHistoryByIdAdmin,
    walletWithdrawRequest,
    walletGetAllWithdrawHistory,
    walletGetWithdrawHistoryById,
    walletGetWithdrawHistoryUser,
    walletGetWithdrawHistoryUserId,
    walletCancelWithdraw,
    walletGetTotalWithdrawUser,
    AdminWallet,
    allWalletAdmin,
    getUserWalletbyId,
    confirmRequestbyAdmin,
    getAllDepositsForAdmin,
    rejectRequestbyAdmin,
    getAllTransactions,
    getUserTransactions
} from '../controllers/wallet.controller.js';
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
 *                 success:
 *                   type: boolean
 *                   example: true
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
 *                     qrCode:
 *                       type: string
 *                       description: QR code string for payment
 *                       example: "00020101021238..."
 *                     qrCodeImageUrl:
 *                       type: string
 *                       description: Base64 encoded QR code image
 *                       example: "data:image/png;base64,..."
 *                     depositRecord:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: Deposit record ID
 *                           example: 123
 *                         depositCode:
 *                           type: string
 *                           description: Unique deposit reference code
 *                           example: DEP1234567890123
 *                         amount:
 *                           type: number
 *                           description: Amount to be deposited
 *                           example: 100000
 *                         status:
 *                           type: string
 *                           enum: [pending, completed, cancelled]
 *                           example: pending
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         username:
 *                           type: string
 *                           example: "john_doe"
 *                         email:
 *                           type: string
 *                           example: "john@example.com"
 *                         currentBalance:
 *                           type: number
 *                           example: 50000
 *                         newBalanceAfterDeposit:
 *                           type: number
 *                           example: 150000
 *                     paymentInfo:
 *                       type: object
 *                       properties:
 *                         description:
 *                           type: string
 *                           example: "Nap 100000 VND"
 *                         amount:
 *                           type: number
 *                           example: 100000
 *                         currency:
 *                           type: string
 *                           example: "VND"
 *                         expiresAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-15T11:00:00Z"
 *                         expiresInMinutes:
 *                           type: integer
 *                           example: 30
 *       400:
 *         description: Invalid request
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
 *                     missing_amount:
 *                       summary: Missing amount
 *                       value: "Missing required field: amount"
 *                     invalid_amount:
 *                       summary: Invalid amount
 *                       value: "Amount must be greater than 0"
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
 *                   example: "User not authenticated"
 *       404:
 *         description: User or wallet not found
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
 *                     user_not_found:
 *                       summary: User not found
 *                       value: "User not found"
 *                     wallet_not_found:
 *                       summary: Wallet not found
 *                       value: "Wallet not found"
 *       500:
 *         description: Internal server error
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
 *                   example: "Error details..."
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
router.post('/payos-webhook', payOSWebhook);  // For actual webhook notifications

/**
 * @swagger
 * /api/wallet/balance:
 *   get:
 *     summary: Get the current wallet info for the authenticated user
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet info retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Wallet not found
 *       500:
 *         description: Internal server error
 */
router.get('/balance', verifyToken, walletGetBalance);

/**
 * @swagger
 * /api/wallet/AllDepositHistoryUser:
 *   get:
 *     summary: Get the transaction history for the authenticated Admin
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/AllDepositHistoryUser', verifyToken, walletGetDepositHistoryUser);

/**
 * @swagger
 * /api/wallet/allDepositsAdmin:
 *   get:
 *     tags:
 *       - Wallet
 *     summary: Get all deposits from all users (Admin only)
 *     description: Retrieve all deposit records from all users with filtering and pagination options
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *         description: Filter by deposit status
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by specific user ID
 *     responses:
 *       200:
 *         description: All deposits retrieved successfully
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
 *                   example: "All deposits retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deposits:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           user_id:
 *                             type: integer
 *                             example: 123
 *                           deposit_code:
 *                             type: string
 *                             example: "DEP1703123456789456"
 *                           amount:
 *                             type: number
 *                             example: 100000
 *                           status:
 *                             type: string
 *                             enum: [pending, completed, cancelled]
 *                             example: "completed"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T10:30:00.000Z"
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T10:35:00.000Z"
 *                           User:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 123
 *                               username:
 *                                 type: string
 *                                 example: "john_doe"
 *                               full_name:
 *                                 type: string
 *                                 example: "John Doe"
 *                               email:
 *                                 type: string
 *                                 example: "john@example.com"
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
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total_deposits:
 *                           type: integer
 *                           example: 50
 *                         total_amount:
 *                           type: number
 *                           example: 5000000
 *                         completed_amount:
 *                           type: number
 *                           example: 4500000
 *                         pending_amount:
 *                           type: number
 *                           example: 500000
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
 *                   example: "User not authenticated"
 *       403:
 *         description: Forbidden - User is not an admin
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
 *                   example: "Access denied. Admin privileges required."
 *       500:
 *         description: Internal server error
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
router.get('/allDepositsAdmin', verifyToken, verifyStaff, getAllDepositsForAdmin);

/**
 * @swagger
 * /api/wallet/depositHistoryAdmin/{id}:
 *   get:
 *     summary: Get a specific transaction by ID (Admin Only)
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Transaction ID to retrieve
 *         example: 123
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 history:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Transaction ID
 *                       example: 123
 *                     user_id:
 *                       type: integer
 *                       description: User ID who made the transaction
 *                       example: 456
 *                     deposit_code:
 *                       type: string
 *                       description: Unique deposit reference code
 *                       example: "DEP1703123456789456"
 *                     amount:
 *                       type: number
 *                       description: Transaction amount in VND
 *                       example: 100000
 *                     status:
 *                       type: string
 *                       enum: [pending, completed, cancelled]
 *                       description: Transaction status
 *                       example: "completed"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       description: Transaction creation timestamp
 *                       example: "2024-01-15T10:30:00.000Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       description: Transaction last update timestamp
 *                       example: "2024-01-15T10:35:00.000Z"
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
 *                   example: "User not authenticated"
 *       404:
 *         description: Transaction not found
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
 *                   example: "Transaction not found"
 *       500:
 *         description: Internal server error
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
 */
router.get('/depositHistoryAdmin/:id', verifyToken, verifyStaff, walletGetDepositHistoryByIdAdmin);

/**
 * @swagger
 * /api/wallet/withdraw:
 *   post:
 *     summary: Create a new wallet withdraw request
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
 *               - bank_name
 *               - account_number
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to withdraw (in VND)
 *                 example: 50000
 *               bank_name:
 *                 type: string
 *                 description: Bank name for the withdrawal
 *                 example: "Vietcombank"
 *               account_number:
 *                 type: string
 *                 description: Bank account number for the withdrawal
 *                 example: "1234567890"
 *     responses:
 *       200:
 *         description: Withdraw request created successfully
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
 *                   example: "Withdraw request submitted successfully. Amount has been deducted from wallet. Waiting for admin approval."
 *                 data:
 *                   type: object
 *                   properties:
 *                     withdrawRecord:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: Withdraw record ID
 *                           example: 123
 *                         amount:
 *                           type: number
 *                           description: Withdraw amount
 *                           example: 50000
 *                         bank_name:
 *                           type: string
 *                           description: Bank name
 *                           example: "Vietcombank"
 *                         account_number:
 *                           type: string
 *                           description: Account number
 *                           example: "1234567890"
 *                         status:
 *                           type: string
 *                           enum: [pending, completed, failed, cancelled]
 *                           description: Withdraw status
 *                           example: "pending"
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           description: Request creation timestamp
 *                           example: "2024-01-15T10:30:00.000Z"
 *                     wallet:
 *                       type: object
 *                       properties:
 *                         previous_balance:
 *                           type: number
 *                           description: Wallet balance before withdraw request
 *                           example: 100000
 *                         requested_amount:
 *                           type: number
 *                           description: Requested withdraw amount
 *                           example: 50000
 *                         new_balance:
 *                           type: number
 *                           description: New wallet balance after amount deduction
 *                           example: 50000
 *                         balance_deducted:
 *                           type: boolean
 *                           description: Confirmation that balance was deducted
 *                           example: true
 *       400:
 *         description: Invalid request data
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
 *                     missing_amount:
 *                       summary: Missing amount
 *                       value: "Missing required field: amount"
 *                     missing_bank_name:
 *                       summary: Missing bank name
 *                       value: "Missing required field: bank_name"
 *                     missing_account_number:
 *                       summary: Missing account number
 *                       value: "Missing required field: account_number"
 *                     invalid_amount:
 *                       summary: Invalid amount
 *                       value: "Amount must be greater than 0"
 *                     insufficient_balance:
 *                       summary: Insufficient balance
 *                       value: "Insufficient balance. Current balance: 10000 VND, Requested amount: 50000 VND"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Wallet not found
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
 *                   example: "Wallet not found. Please create a wallet first."
 *       500:
 *         description: Internal server error
 */
router.post('/withdraw', verifyToken, walletWithdrawRequest);

/**
 * @swagger
 * /api/wallet/withdraw-historyAdmin/{id}:
 *   get:
 *     summary: Get a specific withdraw request by ID (Admin Only)
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Withdraw record ID to retrieve
 *         example: 123
 *     responses:
 *       200:
 *         description: Withdraw record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 withdrawHistory:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Withdraw record ID
 *                       example: 123
 *                     user_id:
 *                       type: integer
 *                       description: User ID who made the withdrawal
 *                       example: 456
 *                     wallet_id:
 *                       type: integer
 *                       description: Associated wallet ID
 *                       example: 789
 *                     amount:
 *                       type: number
 *                       description: Withdrawal amount in VND
 *                       example: 100000
 *                     bank_name:
 *                       type: string
 *                       description: Bank name for withdrawal
 *                       example: "Vietcombank"
 *                     account_number:
 *                       type: string
 *                       description: Bank account number
 *                       example: "1234567890"
 *                     status:
 *                       type: string
 *                       description: Current status of withdrawal
 *                       example: "pending"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       description: Timestamp of withdrawal request
 *                       example: "2023-12-20T15:30:00.000Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Withdraw record not found
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
 *                   example: "Withdraw history not found"
 *       500:
 *         description: Internal server error
 */
router.get('/withdraw-historyAdmin/:id', verifyToken, verifyStaff, walletGetWithdrawHistoryById);
/**
 * @swagger
 * /api/wallet/withdrawAll-historyAdmin:
 *   get:
 *     summary: Get withdraw request history for the authenticated user
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Withdraw history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     withdrawHistory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: Withdraw record ID
 *                             example: 123
 *                           user_id:
 *                             type: integer
 *                             description: User ID
 *                             example: 456
 *                           wallet_id:
 *                             type: integer
 *                             description: Wallet ID
 *                             example: 789
 *                           amount:
 *                             type: number
 *                             description: Withdraw amount
 *                             example: 50000
 *                           bank_name:
 *                             type: string
 *                             description: Bank name
 *                             example: "Vietcombank"
 *                           account_number:
 *                             type: string
 *                             description: Account number
 *                             example: "1234567890"
 *                           status:
 *                             type: string
 *                             enum: [pending, completed, failed, cancelled]
 *                             description: Withdraw status
 *                             example: "pending"
 *                           processed_at:
 *                             type: string
 *                             format: date-time
 *                             description: Processing timestamp (if completed)
 *                             example: "2024-01-15T11:30:00.000Z"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             description: Request creation timestamp
 *                             example: "2024-01-15T10:30:00.000Z"
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *                             description: Last update timestamp
 *                             example: "2024-01-15T10:30:00.000Z"
 *                     totalRequests:
 *                       type: integer
 *                       description: Total number of withdraw requests
 *                       example: 5
 *                     pendingRequests:
 *                       type: integer
 *                       description: Number of pending requests
 *                       example: 2
 *                     completedRequests:
 *                       type: integer
 *                       description: Number of completed requests
 *                       example: 2
 *                     cancelledRequests:
 *                       type: integer
 *                       description: Number of cancelled requests
 *                       example: 1
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/withdrawAll-historyAdmin', verifyToken, verifyStaff, walletGetAllWithdrawHistory);

/**
 * @swagger
 * /api/wallet/withdrawAll-historyUser:
 *   get:
 *     summary: Get withdraw history for the authenticated user
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Withdraw history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 withdrawHistory:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Withdraw record ID
 *                         example: 123
 *                       user_id:
 *                         type: integer
 *                         description: User ID who made the withdrawal
 *                         example: 456
 *                       wallet_id:
 *                         type: integer
 *                         description: Associated wallet ID
 *                         example: 789
 *                       amount:
 *                         type: number
 *                         description: Withdrawal amount in VND
 *                         example: 100000
 *                       bank_name:
 *                         type: string
 *                         description: Bank name
 *                         example: "Vietcombank"
 *                       account_number:
 *                         type: string
 *                         description: Account number
 *                         example: "1234567890"
 *                       status:
 *                         type: string
 *                         enum: [pending, completed, failed, cancelled]
 *                         description: Withdraw status
 *                         example: "pending"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: Request creation timestamp
 *                         example: "2024-01-15T10:30:00.000Z"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         description: Last update timestamp
 *                         example: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/withdrawAll-historyUser', verifyToken, walletGetWithdrawHistoryUser);
/**
 * @swagger
 * /api/wallet/withdraw-historyUserId/{id}:
 *   get:
 *     summary: Get a specific withdrawal history record for the authenticated user
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the withdrawal record
 *     responses:
 *       200:
 *         description: Withdrawal history record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 withdrawHistory:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Withdraw record ID
 *                       example: 123
 *                     user_id:
 *                       type: integer
 *                       description: User ID who made the withdrawal
 *                       example: 456
 *                     wallet_id:
 *                       type: integer
 *                       description: Associated wallet ID
 *                       example: 789
 *                     amount:
 *                       type: number
 *                       description: Withdrawal amount in VND
 *                       example: 100000
 *                     bank_name:
 *                       type: string
 *                       description: Bank name
 *                       example: "Vietcombank"
 *                     account_number:
 *                       type: string
 *                       description: Account number
 *                       example: "1234567890"
 *                     status:
 *                       type: string
 *                       enum: [pending, completed, failed, cancelled]
 *                       description: Withdraw status
 *                       example: "pending"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       description: Request creation timestamp
 *                       example: "2024-01-15T10:30:00.000Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       description: Last update timestamp
 *                       example: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Withdraw history record not found
 *       500:
 *         description: Internal server error
 */
router.get('/withdraw-historyUserId/:id', verifyToken, walletGetWithdrawHistoryUserId);

/**
 * @swagger
 * /api/wallet/cancel-withdraw/{id}:
 *   put:
 *     summary: Cancel a pending withdrawal request
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the withdrawal request to cancel
 *     responses:
 *       200:
 *         description: Withdrawal successfully cancelled
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
 *                   example: "Withdraw cancelled and amount returned to wallet"
 *                 data:
 *                   type: object
 *                   properties:
 *                     withdrawId:
 *                       type: integer
 *                       description: ID of the cancelled withdrawal
 *                       example: 123
 *                     returnedAmount:
 *                       type: number
 *                       description: Amount returned to wallet
 *                       example: 100000
 *                     newBalance:
 *                       type: number
 *                       description: Updated wallet balance
 *                       example: 500000
 *       400:
 *         description: Withdrawal cannot be cancelled (not in pending status)
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
 *                   example: "Withdraw record is not pending"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Withdrawal record or wallet not found
 *       500:
 *         description: Internal server error
 */
router.put('/cancel-withdraw/:id', verifyToken, walletCancelWithdraw);

/**
 * @swagger
 * /api/wallet/totalWithdrawUser:
 *   get:
 *     summary: Get total pending withdrawal amount for current user
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved total withdrawal amount
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 totalWithdraw:
 *                   type: number
 *                   description: Total pending withdrawal amount in VND
 *                   example: 1000000
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/totalWithdrawUser', verifyToken, walletGetTotalWithdrawUser);

/**
 * @swagger
 * /api/wallet/AdminWallet:
 *   get:
 *     summary: Get total balance of admin wallet (Admin only)
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved admin wallet balance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 adminWallet:
 *                   type: number
 *                   description: Total balance in admin wallet (VND)
 *                   example: 10000000
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User is not an admin
 *       500:
 *         description: Internal server error
 */
router.get('/AdminWallet', verifyToken, verifyStaff, AdminWallet);

/**
 * @swagger
 * /api/wallet/allWalletAdmin:
 *   get:
 *     summary: Get all user wallets (Admin only)
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all wallets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 userWallet:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       user_id:
 *                         type: integer
 *                         example: 1
 *                       balance:
 *                         type: number
 *                         example: 1000000
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User is not an admin
 *       500:
 *         description: Internal server error
 */
router.get('/allWalletAdmin', verifyToken, verifyStaff, allWalletAdmin);

/**
 * @swagger
 * /api/wallet/getUserWalletbyId/{id}:
 *   get:
 *     summary: Get wallet information for a specific user
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to get wallet information for
 *     responses:
 *       200:
 *         description: Successfully retrieved wallet information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 wallet:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     balance:
 *                       type: number
 *                       example: 1000000
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Wallet not found
 *       500:
 *         description: Internal server error
 */
router.get('/getUserWalletbyId/:id', verifyToken, verifyAdmin, getUserWalletbyId);

/**
 * @swagger
 * /api/wallet/confirmRequestbyAdmin/{id}:
 *   put:
 *     summary: Confirm a withdrawal request by admin
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Withdrawal request ID to confirm
 *     responses:
 *       200:
 *         description: Withdrawal request confirmed successfully
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
 *                   example: Withdraw request confirmed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       example: completed
 *                     processed_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-01T12:00:00Z
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Withdraw record not found
 *       500:
 *         description: Internal server error
 */
router.put('/confirmRequestbyAdmin/:id', verifyToken, verifyStaff, confirmRequestbyAdmin);

/**
 * @swagger
 * /api/wallet/rejectRequestbyAdmin/{id}:
 *   put:
 *     summary: reject a withdrawal request by admin
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Withdrawal request ID to confirm
 *     responses:
 *       200:
 *         description: Withdrawal request confirmed successfully
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
 *                   example: Withdraw request confirmed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       example: completed
 *                     processed_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-01T12:00:00Z
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Withdraw record not found
 *       500:
 *         description: Internal server error
 */
router.put('/rejectRequestbyAdmin/:id', verifyToken, verifyStaff, rejectRequestbyAdmin);

/**
 * @swagger
 * /api/wallet/transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       from_wallet_id:
 *                         type: integer
 *                         example: 1
 *                       to_wallet_id:
 *                         type: integer
 *                         example: 2
 *                       order_id:
 *                         type: integer
 *                         example: 123
 *                       amount:
 *                         type: number
 *                         example: 100000
 *                       transaction_type:
 *                         type: string
 *                         enum: [order_payment, refund, ai_generation]
 *                         example: "order_payment"
 *                       status:
 *                         type: string
 *                         enum: [pending, completed, failed, cancelled]
 *                         example: "completed"
 *                       description:
 *                         type: string
 *                         example: "Payment for order #123"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:30:00.000Z"
 *                       fromWallet:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           user_id:
 *                             type: integer
 *                             example: 1
 *                           balance:
 *                             type: number
 *                             example: 100000
 *                           User:
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
 *                               role:
 *                                 type: string
 *                                 example: "user"
 *                       toWallet:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 2
 *                           user_id:
 *                             type: integer
 *                             example: 2
 *                           balance:
 *                             type: number
 *                             example: 50000
 *                           User:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 2
 *                               username:
 *                                 type: string
 *                                 example: "jane_doe"
 *                               full_name:
 *                                 type: string
 *                                 example: "Jane Doe"
 *                               avatar:
 *                                 type: string
 *                                 example: "https://example.com/avatar2.jpg"
 *                               role:
 *                                 type: string
 *                                 example: "user"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/transactions', verifyToken, verifyStaff, getAllTransactions);

/**
 * @swagger
 * /api/wallet/transactions/{userId}:
 *   get:
 *     summary: Get all transactions for a specific user
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to get transactions for
 *     responses:
 *       200:
 *         description: Successfully retrieved user transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       from_wallet_id:
 *                         type: integer
 *                         example: 1
 *                       to_wallet_id:
 *                         type: integer
 *                         example: 2
 *                       order_id:
 *                         type: integer
 *                         example: 123
 *                       amount:
 *                         type: number
 *                         example: 100000
 *                       transaction_type:
 *                         type: string
 *                         enum: [order_payment, refund, ai_generation]
 *                         example: "order_payment"
 *                       status:
 *                         type: string
 *                         enum: [pending, completed, failed, cancelled]
 *                         example: "completed"
 *                       description:
 *                         type: string
 *                         example: "Payment for order #123"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:30:00.000Z"
 *                       User:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           username:
 *                             type: string
 *                             example: "john_doe"
 *                           full_name:
 *                             type: string
 *                             example: "John Doe"
 *                           avatar:
 *                             type: string
 *                             example: "https://example.com/avatar.jpg"
 *                           role:
 *                             type: string
 *                             example: "user"
 *       400:
 *         description: Bad request - User ID is required
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/transactions/:userId', verifyToken, getUserTransactions);

export default router;