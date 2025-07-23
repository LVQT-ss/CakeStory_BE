import express from 'express';
import { verifyToken } from '../middleware/verifyUser.js';
import { walletDeposit } from '../controllers/wallet.controller.js';
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



export default router;