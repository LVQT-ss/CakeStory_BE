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
    const dbTransaction = await sequelize.transaction();

    try {
        console.log('PayOS Webhook received:', {
            method: req.method,
            headers: req.headers,
            body: req.body
        });

        // Handle GET request (for webhook testing)
        if (req.method === 'GET') {
            return res.status(200).json({
                success: true,
                message: "PayOS Webhook endpoint is active"
            });
        }

        const webhookData = req.body;

        // Handle empty webhook (PayOS validation test)
        if (!webhookData || Object.keys(webhookData).length === 0) {
            console.log('Empty webhook - PayOS validation test');
            return res.status(200).json({
                success: true,
                message: 'Webhook received successfully'
            });
        }

        // Verify webhook signature
        const signature = req.headers['x-payos-signature'];
        if (!signature) {
            throw new Error('Missing PayOS signature');
        }

        const isValidSignature = payOS.verifyPaymentWebhookSignature(
            signature,
            webhookData
        );

        if (!isValidSignature) {
            console.error('Invalid webhook signature');
            return res.status(401).json({
                success: false,
                message: 'Invalid signature'
            });
        }

        // Extract payment information
        const { data } = webhookData;
        if (!data || !data.orderCode) {
            throw new Error('Invalid webhook data format');
        }

        const { orderCode, amount, status } = data;
        const isSuccessful = status === 'PAID';

        if (!isSuccessful) {
            console.log(`Payment not successful for order ${orderCode}`);
            await DepositRecords.update(
                { status: 'cancelled' },
                {
                    where: { id: orderCode }, // ← FIXED: Use id instead of deposit_code
                    transaction: dbTransaction
                }
            );
            await dbTransaction.commit();
            return res.status(200).json({
                success: true,
                message: 'Payment status updated to cancelled'
            });
        }

        // Find deposit record by ID (not deposit_code)
        const depositRecord = await DepositRecords.findOne({
            where: { id: orderCode }, // ← FIXED: Use id instead of deposit_code
            transaction: dbTransaction
        });

        if (!depositRecord) {
            throw new Error(`Deposit record not found for order ${orderCode}`);
        }

        if (depositRecord.status === 'completed') {
            console.log(`Deposit ${orderCode} already processed`);
            await dbTransaction.commit();
            return res.status(200).json({
                success: true,
                message: 'Payment already processed'
            });
        }

        // Update wallet balance
        const wallet = await Wallet.findOne({
            where: { user_id: depositRecord.user_id },
            transaction: dbTransaction
        });

        if (!wallet) {
            throw new Error(`Wallet not found for user ${depositRecord.user_id}`);
        }

        // Verify amount matches
        if (Number(depositRecord.amount) !== Number(amount)) {
            throw new Error(`Amount mismatch: expected ${depositRecord.amount}, got ${amount}`);
        }

        // Update wallet balance and deposit record
        await wallet.update({
            balance: sequelize.literal(`balance + ${amount}`),
            updated_at: new Date()
        }, { transaction: dbTransaction });

        await depositRecord.update({
            status: 'completed'
        }, { transaction: dbTransaction });

        await dbTransaction.commit();

        console.log(`Successfully processed deposit ${orderCode} for amount ${amount}`);
        return res.status(200).json({
            success: true,
            message: 'Payment processed successfully'
        });

    } catch (error) {
        await dbTransaction.rollback();
        console.error('Webhook error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to process webhook'
        });
    }
};