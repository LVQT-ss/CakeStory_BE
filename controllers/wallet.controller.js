import Wallet from '../models/wallet.model.js';
import DepositRecords from '../models/deposit_records.model.js';
import WithdrawRecords from '../models/withdraw_records.model.js';
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
        console.log('PayOS Webhook received:', {
            method: req.method,
            headers: req.headers,
            body: req.body
        });

        // Handle GET request (direct access for testing)
        if (req.method === 'GET') {
            return res.status(200).json({
                message: "PayOS Webhook endpoint is active",
                status: "ok",
                method: "POST required"
            });
        }

        // Handle webhook logic here - using working logic from main app
        const webhookData = req.body;

        // Handle empty webhook (PayOS validation test)
        if (!webhookData || Object.keys(webhookData).length === 0) {
            console.log('Empty webhook - likely PayOS validation test');
            return res.status(200).json({
                status: 'success',
                message: 'Webhook received successfully'
            });
        }

        // Handle PayOS webhook format
        let orderCode, amount, isSuccessful = false;

        if (webhookData.data) {
            // PayOS webhook format: { code: '00', success: true, data: { orderCode, amount, status } }
            orderCode = webhookData.data.orderCode;
            amount = webhookData.data.amount;
            // Check if payment is successful using PayOS format
            isSuccessful = webhookData.code === '00' && webhookData.success === true;
        } else {
            // Direct format: { orderCode, amount, status }
            orderCode = webhookData.orderCode;
            amount = webhookData.amount;
            isSuccessful = webhookData.status === 'PAID';
        }

        console.log('Processing webhook:', {
            orderCode,
            amount,
            isSuccessful,
            webhookCode: webhookData.code,
            webhookSuccess: webhookData.success
        });

        // If payment is successful, process it
        if (orderCode && isSuccessful) {
            console.log(`🎉 Payment successful for order ${orderCode}!`);

            // Find deposit record
            const depositRecord = await DepositRecords.findByPk(orderCode);
            if (!depositRecord) {
                console.log(`❌ Deposit record ${orderCode} not found`);
                return res.status(404).json({ message: "Deposit record not found" });
            }

            if (depositRecord.status === 'completed') {
                console.log(`✅ Deposit record ${orderCode} already completed`);
                return res.status(200).json({
                    status: 'success',
                    message: "Deposit already processed"
                });
            }

            // Check amount matches
            if (parseFloat(depositRecord.amount) !== parseFloat(amount)) {
                console.log(`❌ Amount mismatch: expected ${depositRecord.amount}, got ${amount}`);
                return res.status(400).json({ message: "Amount mismatch" });
            }

            // Find the user's wallet
            const wallet = await Wallet.findOne({ where: { user_id: depositRecord.user_id } });
            if (!wallet) {
                console.log(`❌ Wallet for user ${depositRecord.user_id} not found`);
                return res.status(404).json({ message: "User wallet not found" });
            }

            // Use a DB transaction for atomicity
            await sequelize.transaction(async (t) => {
                // Update deposit record
                console.log(`Updating deposit record ${depositRecord.id} to completed...`);
                const [depositUpdateCount] = await DepositRecords.update(
                    { status: 'completed' },
                    { where: { id: depositRecord.id }, transaction: t }
                );
                console.log(`Deposit record update result: ${depositUpdateCount}`);

                // Update wallet balance
                const newBalance = parseFloat(wallet.balance) + parseFloat(amount);
                console.log(`Updating wallet ${wallet.id} balance: ${wallet.balance} + ${amount} = ${newBalance}`);
                const [walletUpdateCount] = await Wallet.update(
                    { balance: newBalance, updated_at: new Date() },
                    { where: { id: wallet.id }, transaction: t }
                );
                console.log(`Wallet update result: ${walletUpdateCount}`);
            });

            console.log(`✅ SUCCESS: Deposit ${orderCode} processed and wallet updated.`);
            return res.status(200).json({ status: 'success', message: 'Deposit processed and wallet updated' });
        } else {
            console.log(`ℹ️ Webhook received but not processed - orderCode: ${orderCode}, isSuccessful: ${isSuccessful}`);
            // Simple response for other cases
            return res.status(200).json({
                status: 'success',
                message: 'Webhook received successfully'
            });
        }
    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to process webhook'
        });
    }
};


export const walletGetBalance = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        const wallet = await Wallet.findOne({ where: { user_id: userId } });
        if (!wallet) {
            return res.status(404).json({ success: false, message: 'Wallet not found' });
        }
        return res.status(200).json({ success: true, wallet });
    } catch (error) {
        console.error('walletGetBalance error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const walletGetHistory = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        const history = await DepositRecords.findAll({ where: { user_id: userId } });
        return res.status(200).json({ success: true, history });
    } catch (error) {
        console.error('walletGetHistory error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const walletGetHistoryById = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        const history = await DepositRecords.findByPk(req.params.id);
        if (!history) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }
        return res.status(200).json({ success: true, history });
    } catch (error) {
        console.error('walletGetHistoryById error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const walletWithdrawRequest = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const { amount, bank_name, account_number } = req.body;

        // Validate required fields
        if (!amount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required field: amount'
            });
        }

        if (!bank_name) {
            return res.status(400).json({
                success: false,
                message: 'Missing required field: bank_name'
            });
        }

        if (!account_number) {
            return res.status(400).json({
                success: false,
                message: 'Missing required field: account_number'
            });
        }

        // Validate amount
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
        }

        // Find user's wallet
        const wallet = await Wallet.findOne({ where: { user_id: userId } });
        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: 'Wallet not found. Please create a wallet first.'
            });
        }

        // Check if user has sufficient balance
        const currentBalance = parseFloat(wallet.balance);
        const withdrawAmount = parseFloat(amount);

        if (withdrawAmount > currentBalance) {
            return res.status(400).json({
                success: false,
                message: `Insufficient balance. Current balance: ${currentBalance} VND, Requested amount: ${withdrawAmount} VND`
            });
        }

        // Use database transaction to ensure data consistency
        const result = await sequelize.transaction(async (t) => {
            // Create withdraw record with pending status
            const withdrawRecord = await WithdrawRecords.create({
                user_id: userId,
                wallet_id: wallet.id,
                amount: withdrawAmount,
                bank_name: bank_name,
                account_number: account_number,
                status: 'pending',
                created_at: new Date()
            }, { transaction: t });

            // Update wallet balance by deducting the withdraw amount
            const newBalance = currentBalance - withdrawAmount;
            await Wallet.update(
                {
                    balance: newBalance,
                    updated_at: new Date()
                },
                {
                    where: { id: wallet.id },
                    transaction: t
                }
            );

            return { withdrawRecord, newBalance };
        });

        return res.status(200).json({
            success: true,
            message: 'Withdraw request submitted successfully. Amount has been deducted from wallet. Waiting for admin approval.',
            data: {
                withdrawRecord: {
                    id: result.withdrawRecord.id,
                    amount: result.withdrawRecord.amount,
                    bank_name: result.withdrawRecord.bank_name,
                    account_number: result.withdrawRecord.account_number,
                    status: result.withdrawRecord.status,
                    created_at: result.withdrawRecord.created_at
                },
                wallet: {
                    previous_balance: currentBalance,
                    requested_amount: withdrawAmount,
                    new_balance: result.newBalance,
                    balance_deducted: true
                }
            }
        });

    } catch (error) {
        console.error('walletWithdrawRequest error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

export const walletGetAllWithdrawHistory = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const withdrawHistory = await WithdrawRecords.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: {
                withdrawHistory: withdrawHistory,
                totalRequests: withdrawHistory.length,
                pendingRequests: withdrawHistory.filter(record => record.status === 'pending').length,
                completedRequests: withdrawHistory.filter(record => record.status === 'completed').length,
                cancelledRequests: withdrawHistory.filter(record => record.status === 'cancelled').length
            }
        });
    } catch (error) {
        console.error('walletGetWithdrawHistory error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}
export const walletGetWithdrawHistoryById = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        const withdrawHistory = await WithdrawRecords.findByPk(req.params.id);
        if (!withdrawHistory) {
            return res.status(404).json({ success: false, message: 'Withdraw history not found' });
        }
        return res.status(200).json({ success: true, withdrawHistory });
    } catch (error) {
        console.error('walletGetWithdrawHistoryById error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}
