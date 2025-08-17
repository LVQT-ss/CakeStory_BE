import { storage } from '../utils/firebase.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AiGeneratedImage from '../models/ai_generated_image.model.js';
import Wallet from '../models/wallet.model.js';
import Transaction from '../models/transaction.model.js';
import User from '../models/User.model.js';
import sequelize from '../database/db.js';
import OpenAI from 'openai';
import axios from 'axios';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const generateImage = async (req, res) => {
    try {
        const { prompt } = req.body;
        const userId = req.userId; // From auth middleware
        const AI_GENERATION_COST = 1000; // Cost per image generation

        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        // Use transaction to ensure data consistency
        const result = await sequelize.transaction(async (t) => {
            // 1. Check if user has wallet
            const wallet = await Wallet.findOne({
                where: { user_id: userId },
                transaction: t
            });

            if (!wallet) {
                // Tạo transaction với status failed nếu không tìm thấy wallet
                const transaction = await Transaction.create({
                    from_wallet_id: null,
                    amount: AI_GENERATION_COST,
                    transaction_type: 'ai_generation',
                    status: 'failed',
                    description: `AI Image Generation: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''} - Wallet not found`,
                }, { transaction: t });
                console.log(`❌ Transaction ${transaction.id} marked as failed - Wallet not found`);
                throw new Error('Wallet not found. Please contact support.');
            }

            // 2. Create transaction record (pending status) TRƯỚC khi kiểm tra balance
            const transaction = await Transaction.create({
                from_wallet_id: wallet.id,
                amount: AI_GENERATION_COST,
                transaction_type: 'ai_generation',
                status: 'pending',
                description: `AI Image Generation: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`,
            }, { transaction: t });

            // 3. Check if user has sufficient balance
            if (wallet.balance < AI_GENERATION_COST) {
                // Update transaction status to failed
                await Transaction.update({
                    status: 'failed'
                }, {
                    where: { id: transaction.id },
                    transaction: t
                });
                console.log(`❌ Transaction ${transaction.id} marked as failed - Insufficient balance`);
                throw new Error(`Insufficient balance. Required: ${AI_GENERATION_COST} VND, Available: ${wallet.balance} VND`);
            }

            // 4. TRỪ TIỀN NGAY LẬP TỨC sau khi kiểm tra đủ tiền
            const newBalance = wallet.balance - AI_GENERATION_COST;
            console.log(`💰 TRỪ TIỀN NGAY: ${wallet.balance} - ${AI_GENERATION_COST} = ${newBalance}`);

            await Wallet.update({
                balance: newBalance,
                updated_at: new Date()
            }, {
                where: { id: wallet.id },
                transaction: t
            });

            // Verify trừ tiền thành công
            const updatedWallet = await Wallet.findByPk(wallet.id, { transaction: t });
            console.log(`✅ Đã trừ tiền thành công: ${updatedWallet.balance}`);

            // 5. UPDATE TRANSACTION STATUS = COMPLETED sau khi trừ tiền thành công
            await Transaction.update({
                status: 'completed'
            }, {
                where: { id: transaction.id },
                transaction: t
            });
            console.log(`✅ Transaction ${transaction.id} đã được update thành completed`);

            // 6. Generate image using OpenAI
            const styledPrompt = `Close-up, eye-level shot of a cake on a stand, with soft, even lighting and a simple, blurred background. The focus is on the cake's presentation, highlighting its details elegantly of ${prompt}`;

            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: styledPrompt,
                n: 1,
                size: "1024x1024",
            });

            // 6. Get the image URL from OpenAI response
            const imageUrl = response.data[0].url;

            // 7. Download the image from OpenAI
            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(imageResponse.data);

            // 8. Generate unique filename with user's folder
            const filename = `ai_generated/${userId}/${Date.now()}.png`;

            // 9. Upload to Firebase Storage with metadata
            const storageRef = ref(storage, filename);
            const metadata = {
                contentType: 'image/png',
                customMetadata: {
                    userId: userId.toString(),
                    prompt: prompt
                }
            };

            await uploadBytes(storageRef, buffer, metadata);

            // 10. Get the Firebase Storage URL
            const firebaseUrl = await getDownloadURL(storageRef);

            // 11. Save AI generated image to database
            const savedImage = await AiGeneratedImage.create({
                user_id: userId,
                prompt: prompt,
                image_url: firebaseUrl,
            }, { transaction: t });

            // 12. Update transaction with AI generated image ID (status đã là completed rồi)
            await Transaction.update({
                ai_generated_image_id: savedImage.id
            }, {
                where: { id: transaction.id },
                transaction: t
            });
            console.log(`✅ Đã link AI image ${savedImage.id} với transaction ${transaction.id}`);

            // Final check balance sau khi hoàn thành
            const finalWallet = await Wallet.findByPk(wallet.id, { transaction: t });
            console.log(`🎯 Balance cuối cùng: ${finalWallet.balance}`);

            return {
                transaction,
                savedImage,
                newBalance: finalWallet.balance,
                previousBalance: wallet.balance
            };
        });

        res.status(200).json({
            message: 'Image generated successfully',
            data: {
                image: result.savedImage,
                transaction: {
                    id: result.transaction.id,
                    amount: result.transaction.amount,
                    status: result.transaction.status,
                    description: result.transaction.description
                },
                wallet: {
                    previousBalance: result.previousBalance,
                    newBalance: result.newBalance,
                    deductedAmount: result.transaction.amount
                }
            }
        });

    } catch (error) {
        console.error('Error generating image:', error);

        // Handle specific error cases
        if (error.message.includes('Insufficient balance')) {
            return res.status(402).json({
                message: 'Insufficient balance',
                error: error.message,
                requiredAmount: 1000,
                suggestion: 'Please top up your wallet to continue using AI generation'
            });
        }

        if (error.message.includes('Wallet not found')) {
            return res.status(404).json({
                message: 'Wallet not found',
                error: error.message,
                suggestion: 'Please contact support to create your wallet'
            });
        }

        // Nếu có lỗi khác, cần update transaction status thành failed
        if (error.message.includes('Transaction')) {
            // Transaction đã được tạo và có thể đã được update thành failed
            console.log('Transaction đã được xử lý với status failed');
        }

        res.status(500).json({
            message: 'Error generating image',
            error: error.message
        });
    }
};

export const getUserGeneratedImages = async (req, res) => {
    try {
        const userId = req.userId;

        const images = await AiGeneratedImage.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            message: 'Images retrieved successfully',
            data: images
        });

    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({
            message: 'Error fetching images',
            error: error.message
        });
    }
};


export const totalAmountAiGenerate = async (req, res) => {
    try {
        const totalAmount = await Transaction.sum('amount', {
            where: {
                status: 'completed',
                transaction_type: 'ai_generation'
            }
        });
        return res.status(200).json({
            success: true,
            totalAmount: totalAmount || 0 // Return 0 if no records found
        });
    } catch (error) {
        console.error('totalAmountAiGenerate error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

export const freeGenerateImage = async (req, res) => {
    try {
        const { prompt } = req.body;
        const userId = req.userId; // From auth middleware

        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        // Check if user has free AI image generations remaining
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.AiImageFree <= 0) {
            return res.status(403).json({
                message: 'You have used all your free AI image generations. Please use the paid service or contact support.',
                remainingFree: 0
            });
        }

        // Generate image using OpenAI
        const response = await openai.images.generate({
            model: "dall-e-2",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
        });

        // Get the image URL from OpenAI response
        const imageUrl = response.data[0].url;

        // Download the image from OpenAI
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(imageResponse.data);

        // Generate unique filename with user's folder
        const filename = `ai_generated/${userId}/${Date.now()}.png`;

        // Upload to Firebase Storage with metadata
        const storageRef = ref(storage, filename);
        const metadata = {
            contentType: 'image/png',
            customMetadata: {
                userId: userId.toString(),
                prompt: prompt
            }
        };

        await uploadBytes(storageRef, buffer, metadata);

        // Get the Firebase Storage URL
        const firebaseUrl = await getDownloadURL(storageRef);

        // Save to database
        const savedImage = await AiGeneratedImage.create({
            user_id: userId,
            prompt: prompt,
            image_url: firebaseUrl,
        });

        // Decrease free AI image count
        await user.update({
            AiImageFree: user.AiImageFree - 1
        });

        res.status(200).json({
            message: 'Image generated successfully',
            data: savedImage,
            remainingFree: user.AiImageFree - 1
        });

    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({
            message: 'Error generating image',
            error: error.message
        });
    }
};

export const getFreeUsageCount = async (req, res) => {
    try {
        const userId = req.userId; // From auth middleware

        const user = await User.findByPk(userId, {
            attributes: ['id', 'username', 'AiImageFree']
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Free usage count retrieved successfully',
            data: {
                userId: user.id,
                username: user.username,
                remainingFree: user.AiImageFree,
                maxFree: 3
            }
        });

    } catch (error) {
        console.error('Error getting free usage count:', error);
        res.status(500).json({
            message: 'Error getting free usage count',
            error: error.message
        });
    }
};