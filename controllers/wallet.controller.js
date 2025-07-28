import Wallet from '../models/wallet.model.js';
import DepositRecords from '../models/deposit_records.model.js';
import PayOS from '@payos/node';
import sequelize from '../database/db.js';
import QRCode from 'qrcode';
import User from '../models/User.model.js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize PayOS with environment variables
const payOS = new PayOS(
    process.env.PAYOS_CLIENT_ID,
    process.env.PAYOS_API_KEY,
    process.env.PAYOS_CHECKSUM_KEY
);

export const walletDeposit = async (req, res) => {
    try {
        // Validate authentication - check for req.userId (set by your middleware)
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const { amount } = req.body;
        const userId = req.userId; // Get userId from middleware

        // Validate required fields - only amount is needed since userId comes from token
        if (!amount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required field: amount'
            });
        }

        // Validate amount
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
        }

        // Find or create wallet (we need this to ensure wallet exists)
        const [wallet] = await Wallet.findOrCreate({
            where: { user_id: userId },
            defaults: {
                balance: 0,
                updated_at: new Date()
            }
        });

        // Get user details
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate unique deposit code
        const depositCode = `DEP${Date.now()}${userId}`;

        // Create deposit record (we need this for tracking)
        const depositRecord = await DepositRecords.create({
            user_id: userId,
            deposit_code: depositCode,
            amount: amount,
            status: 'pending',
            created_at: new Date()
        });

        // Create PayOS payment request
        const paymentData = {
            orderCode: depositRecord.id,
            amount: parseInt(amount), // PayOS requires integer amount
            description: `Nap ${amount} VND`, // Similar to the coin package format
            expiredAt: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes expiry
            returnUrl: process.env.PAYOS_RETURN_URL,
            cancelUrl: process.env.PAYOS_CANCEL_URL,
            payment_provider: 'payos',
            external_transaction_id: `PAYOS-${Date.now()}-${userId}`
        };

        // Generate payment URL using PayOS
        const paymentResponse = await payOS.createPaymentLink(paymentData);

        // Generate QR code image from PayOS QR string
        let qrCodeImageUrl = null;
        if (paymentResponse.qrCode) {
            try {
                qrCodeImageUrl = await QRCode.toDataURL(paymentResponse.qrCode);
            } catch (qrError) {
                console.warn('Failed to generate QR code image:', qrError);
            }
        }

        // Return comprehensive response
        return res.status(200).json({
            success: true,
            message: 'Payment link generated successfully',
            data: {
                paymentUrl: paymentResponse.checkoutUrl,
                qrCode: paymentResponse.qrCode,
                qrCodeImageUrl: qrCodeImageUrl,
                depositRecord: {
                    id: depositRecord.id,
                    depositCode: depositCode,
                    amount: amount,
                    status: 'pending'
                },
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    currentBalance: wallet.balance,
                    newBalanceAfterDeposit: Number(wallet.balance) + Number(amount)
                },
                paymentInfo: {
                    description: paymentData.description,
                    amount: amount,
                    currency: 'VND',
                    expiresAt: new Date(paymentData.expiredAt * 1000).toISOString(),
                    expiresInMinutes: 30
                }
            }
        });

    } catch (error) {
        console.error('Wallet deposit error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

export const payOSWebhook = async (req, res) => {
    try {
        // 1. Log and parse webhook data
        const webhookData = req.body;
        console.log('PayOS Webhook received:', webhookData);

        // 2. Validate webhook data
        if (!webhookData || !webhookData.data || !webhookData.data.orderCode || !webhookData.data.amount) {
            return res.status(400).json({ success: false, message: 'Invalid webhook data' });
        }

        const { orderCode, amount, status } = webhookData.data;

        // 3. Only process successful payments
        if (status !== 'PAID') {
            return res.status(200).json({ success: true, message: 'Payment not completed, no action taken' });
        }

        // 4. Find the deposit record
        const depositRecord = await DepositRecords.findByPk(orderCode);
        if (!depositRecord) {
            return res.status(404).json({ success: false, message: 'Deposit record not found' });
        }

        // 5. Idempotency: If already completed, do nothing
        if (depositRecord.status === 'completed') {
            return res.status(200).json({ success: true, message: 'Deposit already processed' });
        }

        // 6. Check amount matches
        if (parseFloat(depositRecord.amount) !== parseFloat(amount)) {
            return res.status(400).json({ success: false, message: 'Amount mismatch' });
        }

        // 7. Find the user's wallet
        const wallet = await Wallet.findOne({ where: { user_id: depositRecord.user_id } });
        if (!wallet) {
            return res.status(404).json({ success: false, message: 'User wallet not found' });
        }

        // 8. Use a DB transaction for atomicity
        await sequelize.transaction(async (t) => {
            // Update deposit record
            await depositRecord.update({ status: 'completed' }, { transaction: t });

            // Update wallet balance
            await wallet.update(
                { balance: parseFloat(wallet.balance) + parseFloat(amount), updated_at: new Date() },
                { transaction: t }
            );
        });

        // 9. Respond success
        return res.status(200).json({ success: true, message: 'Deposit processed and wallet updated' });

    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};