import CakeDesign from '../models/cake_design.model.js';
import User from '../models/User.model.js';
import Wallet from '../models/wallet.model.js';
import Transaction from '../models/transaction.model.js';
import { Op } from 'sequelize';
import { storage } from '../utils/firebase.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import axios from 'axios';
import { Buffer } from 'buffer';
import process from 'process';
import sequelize from '../database/db.js';
import FormData from 'form-data';

// Helper function to validate Base64 image
const isValidBase64Image = (str) => {
    // Check if it's a URL
    if (str.startsWith('http://') || str.startsWith('https://')) {
        return true;
    }

    // Check if it's a valid Base64 image
    const base64Regex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/;
    if (base64Regex.test(str)) {
        return true;
    }

    // Check if it's a pure Base64 string (without data URL prefix)
    const pureBase64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    return pureBase64Regex.test(str) && str.length > 0;
};

// Create a new cake design
export const createCakeDesign = async (req, res) => {
    try {
        const { description, design_image, is_public, ai_generated } = req.body;
        const user_id = req.userId; // From JWT token

        // Check if we have design_image from multer (file upload) or from request body
        let finalDesignImage = design_image;

        // If design_image is provided in body, validate it
        if (finalDesignImage && !isValidBase64Image(finalDesignImage)) {
            return res.status(400).json({
                success: false,
                message: 'design_image must be a valid URL or Base64 encoded image'
            });
        }

        // Validate that we have a design_image (either from file upload or request body)
        if (!finalDesignImage) {
            return res.status(400).json({
                success: false,
                message: 'design_image is required (either upload a file or provide Base64/URL)'
            });
        }

        // Check if user exists
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Create cake design
        const cakeDesign = await CakeDesign.create({
            user_id,
            description,
            design_image: finalDesignImage,
            is_public: is_public !== undefined ? is_public : true,
            ai_generated: ai_generated || null
        });

        res.status(201).json({
            success: true,
            message: 'Cake design created successfully',
            data: cakeDesign
        });
    } catch (error) {
        console.error('Error creating cake design:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

export const getCakeDesigns = async (req, res) => {
    try {
        const { page = 1, limit = 10, is_public, ai_generated, user_id } = req.query;
        const currentUserId = req.userId;
        const offset = (page - 1) * limit;

        // Build where clause - show public designs or user's own designs
        const whereClause = {
            [Op.or]: [
                { is_public: true },
                { user_id: currentUserId }
            ]
        };

        // Apply additional filters if provided
        if (is_public !== undefined) {
            whereClause.is_public = is_public === 'true';
        }
        if (ai_generated !== undefined) {
            if (ai_generated === 'true') {
                whereClause.ai_generated = { [Op.ne]: null };
            } else if (ai_generated === 'false') {
                whereClause.ai_generated = null;
            } else {
                whereClause.ai_generated = ai_generated;
            }
        }
        if (user_id) {
            whereClause.user_id = user_id;
        }

        const { count, rows: cakeDesigns } = await CakeDesign.findAndCountAll({
            attributes: { exclude: ['design_image'] },
            where: whereClause,
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'full_name', 'avatar']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            success: true,
            message: 'Cake designs fetched successfully',
            data: {
                cakeDesigns,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(count / limit),
                    total_items: count,
                    items_per_page: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching cake designs:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Generate AI cake design from existing cake design ID
export const generateAICakeDesign = async (req, res) => {
    try {
        const { cake_design_id } = req.body;
        const user_id = req.userId; // From JWT token
        const AI_GENERATION_COST = 1000; // Cost per image generation

        // Validate required fields
        if (!cake_design_id) {
            return res.status(400).json({
                success: false,
                message: 'cake_design_id is required'
            });
        }

        // Use transaction to ensure data consistency
        const result = await sequelize.transaction(async (t) => {
            // 1. Check if user exists
            const user = await User.findByPk(user_id, { transaction: t });
            if (!user) {
                throw new Error('User not found');
            }

            // 2. Check if user has wallet
            const wallet = await Wallet.findOne({
                where: { user_id: user_id },
                transaction: t
            });

            if (!wallet) {
                // Tạo transaction với status failed nếu không tìm thấy wallet
                const transaction = await Transaction.create({
                    from_wallet_id: null,
                    amount: AI_GENERATION_COST,
                    transaction_type: 'ai_generation',
                    status: 'failed',
                    description: `AI Cake Design Generation for design ID ${cake_design_id} - Wallet not found`,
                }, { transaction: t });
                console.log(`❌ Transaction ${transaction.id} marked as failed - Wallet not found`);
                throw new Error('Wallet not found. Please contact support.');
            }

            // 3. Find the existing cake design by ID
            const existingCakeDesign = await CakeDesign.findByPk(cake_design_id, { transaction: t });
            if (!existingCakeDesign) {
                // Tạo transaction failed cho cake design không tồn tại
                const transaction = await Transaction.create({
                    from_wallet_id: wallet.id,
                    amount: AI_GENERATION_COST,
                    transaction_type: 'ai_generation',
                    status: 'failed',
                    description: `AI Cake Design Generation for design ID ${cake_design_id} - Cake design not found`,
                }, { transaction: t });
                console.log(`❌ Transaction ${transaction.id} marked as failed - Cake design not found`);
                throw new Error('Cake design not found');
            }

            // 4. Check if user has permission to access this cake design
            if (!existingCakeDesign.is_public && existingCakeDesign.user_id !== user_id) {
                const transaction = await Transaction.create({
                    from_wallet_id: wallet.id,
                    amount: AI_GENERATION_COST,
                    transaction_type: 'ai_generation',
                    status: 'failed',
                    description: `AI Cake Design Generation for design ID ${cake_design_id} - Access denied`,
                }, { transaction: t });
                console.log(`❌ Transaction ${transaction.id} marked as failed - Access denied`);
                throw new Error('Access denied. You can only generate AI designs from your own designs or public designs.');
            }

            // 5. Check if AI image already exists
            if (existingCakeDesign.ai_generated) {
                const transaction = await Transaction.create({
                    from_wallet_id: wallet.id,
                    amount: AI_GENERATION_COST,
                    transaction_type: 'ai_generation',
                    status: 'failed',
                    description: `AI Cake Design Generation for design ID ${cake_design_id} - AI image already exists`,
                }, { transaction: t });
                console.log(`❌ Transaction ${transaction.id} marked as failed - AI image already exists`);
                throw new Error('AI image already exists for this cake design. You can only generate one AI image per design.');
            }

            // 6. Create transaction record (pending status) TRƯỚC khi kiểm tra balance
            const transaction = await Transaction.create({
                from_wallet_id: wallet.id,
                amount: AI_GENERATION_COST,
                transaction_type: 'ai_generation',
                status: 'pending',
                description: `AI Cake Design Generation for design ID ${cake_design_id}`,
            }, { transaction: t });

            // 7. Check if user has sufficient balance
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

            // 8. TRỪ TIỀN NGAY LẬP TỨC sau khi kiểm tra đủ tiền
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

            // 9. UPDATE TRANSACTION STATUS = COMPLETED sau khi trừ tiền thành công
            await Transaction.update({
                status: 'completed'
            }, {
                where: { id: transaction.id },
                transaction: t
            });
            console.log(`✅ Transaction ${transaction.id} đã được update thành completed`);

            return {
                transaction,
                existingCakeDesign,
                wallet: updatedWallet,
                previousBalance: wallet.balance
            };
        });

        const { design_image, description } = result.existingCakeDesign;

        // Convert image to buffer for DALL-E 2 edit
        let imageBuffer;
        if (design_image.startsWith('data:image/')) {
            // Base64 to buffer
            const base64Data = design_image.split(',')[1];
            imageBuffer = Buffer.from(base64Data, 'base64');
        } else if (design_image.startsWith('http://') || design_image.startsWith('https://')) {
            // URL to buffer
            const response = await axios.get(design_image, { responseType: 'arraybuffer' });
            imageBuffer = Buffer.from(response.data);
        } else {
            // Pure base64 to buffer
            imageBuffer = Buffer.from(design_image, 'base64');
        }

        // Create default mask for editing (center circle)
        const { createCanvas } = await import('canvas');
        const canvas = createCanvas(1024, 1024);
        const ctx = canvas.getContext('2d');

        // Transparent background (areas to keep unchanged)
        ctx.clearRect(0, 0, 1024, 1024);

        // White circle in center (area to edit)
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.beginPath();
        ctx.arc(512, 512, 300, 0, 2 * Math.PI);
        ctx.fill();

        const maskBuffer = canvas.toBuffer('image/png');

        // Create enhanced prompt for editing
        const editPrompt = `Transform this cake design into a beautiful, professional cake with:
        - Enhanced decorations and artistic elements
        - Premium bakery-quality appearance  
        - Creative and unique design features
        - Appealing colors and textures
        - Professional cake styling
        Based on description: "${description || 'A beautiful cake design'}"`;

        // Create FormData for DALL-E 2 edit endpoint
        const formData = new FormData();
        formData.append('image', imageBuffer, {
            filename: 'cake_design.png',
            contentType: 'image/png'
        });
        formData.append('mask', maskBuffer, {
            filename: 'mask.png',
            contentType: 'image/png'
        });
        formData.append('prompt', editPrompt);
        formData.append('n', '1');
        formData.append('size', '1024x1024');

        // Use DALL-E 2 edit endpoint instead of generation
        const response = await axios.post('https://api.openai.com/v1/images/edits', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });

        // Get the edited image URL
        const generatedImageUrl = response.data.data[0].url;
        console.log('AI image edited successfully:', generatedImageUrl);

        // Download the generated image
        const imageResponse = await axios.get(generatedImageUrl, { responseType: 'arraybuffer' });
        const generatedImageBuffer = Buffer.from(imageResponse.data);

        // Generate unique filename for Firebase
        const filename = `ai_cake_designs/${user_id}/${Date.now()}_ai_edited.png`;

        // Upload to Firebase Storage
        const storageRef = ref(storage, filename);
        const metadata = {
            contentType: 'image/png',
            customMetadata: {
                userId: user_id.toString(),
                originalDescription: description || 'A beautiful cake design',
                aiGenerated: 'true',
                model: 'dall-e-2-edit',
                originalCakeDesignId: cake_design_id.toString()
            }
        };

        console.log('Uploading to Firebase:', filename);
        await uploadBytes(storageRef, generatedImageBuffer, metadata);

        // Get Firebase Storage URL
        const firebaseUrl = await getDownloadURL(storageRef);
        console.log('Firebase URL obtained:', firebaseUrl);

        // Update the existing cake design with AI generated image URL
        await CakeDesign.update({
            ai_generated: firebaseUrl
        }, {
            where: { id: cake_design_id }
        });

        console.log('Database updated successfully');

        // Update transaction with cake design ID (status đã là completed rồi)
        await Transaction.update({
            description: `AI Cake Design Edit for design ID ${cake_design_id} - Completed successfully`
        }, {
            where: { id: result.transaction.id }
        });
        console.log(`✅ Đã cập nhật description cho transaction ${result.transaction.id}`);

        // Fetch the updated cake design with user information
        const updatedCakeDesign = await CakeDesign.findByPk(cake_design_id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'full_name', 'avatar']
                }
            ]
        });

        if (!updatedCakeDesign) {
            throw new Error('Failed to fetch updated cake design');
        }

        // Final check balance sau khi hoàn thành
        const finalWallet = await Wallet.findByPk(result.wallet.id);
        console.log(`🎯 Balance cuối cùng: ${finalWallet.balance}`);

        res.status(200).json({
            success: true,
            message: 'AI cake design edited successfully',
            data: {
                cakeDesign: {
                    id: updatedCakeDesign.id,
                    user_id: updatedCakeDesign.user_id,
                    description: updatedCakeDesign.description,
                    design_image: updatedCakeDesign.design_image, // Keep original user image
                    created_at: updatedCakeDesign.created_at,
                    is_public: updatedCakeDesign.is_public,
                    ai_generated: updatedCakeDesign.ai_generated, // Store Firebase URL here
                    User: updatedCakeDesign.User
                },
                transaction: {
                    id: result.transaction.id,
                    amount: result.transaction.amount,
                    status: 'completed',
                    description: result.transaction.description
                },
                wallet: {
                    previousBalance: result.previousBalance,
                    newBalance: finalWallet.balance,
                    deductedAmount: result.transaction.amount
                }
            }
        });

    } catch (error) {
        console.error('Error generating AI cake design:', error);

        // Handle specific payment error cases
        if (error.message.includes('Insufficient balance')) {
            return res.status(402).json({
                success: false,
                message: 'Insufficient balance',
                error: error.message,
                requiredAmount: 1000,
                suggestion: 'Please top up your wallet to continue using AI cake design generation'
            });
        }

        if (error.message.includes('Wallet not found')) {
            return res.status(404).json({
                success: false,
                message: 'Wallet not found',
                error: error.message,
                suggestion: 'Please contact support to create your wallet'
            });
        }

        if (error.message.includes('User not found')) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                error: error.message
            });
        }

        if (error.message.includes('Cake design not found')) {
            return res.status(404).json({
                success: false,
                message: 'Cake design not found',
                error: error.message
            });
        }

        if (error.message.includes('Access denied')) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
                error: error.message
            });
        }

        if (error.message.includes('AI image already exists')) {
            return res.status(400).json({
                success: false,
                message: 'AI image already exists',
                error: error.message
            });
        }

        // Handle OpenAI specific errors
        if (error.message.includes('OpenAI') || error.message.includes('API key')) {
            return res.status(500).json({
                success: false,
                message: 'Error generating AI image',
                error: 'AI service temporarily unavailable. Please check your OpenAI API key.'
            });
        }

        // Handle Vision API specific errors
        if (error.message.includes('vision') || error.message.includes('image_url')) {
            return res.status(500).json({
                success: false,
                message: 'Error analyzing image with AI vision',
                error: 'AI vision service temporarily unavailable. Please try again later.'
            });
        }

        // Handle Firebase errors
        if (error.message.includes('Firebase') || error.message.includes('storage')) {
            return res.status(500).json({
                success: false,
                message: 'Error uploading image to storage',
                error: 'Storage service temporarily unavailable.'
            });
        }

        // Handle network errors
        if (error.message.includes('network') || error.message.includes('timeout')) {
            return res.status(500).json({
                success: false,
                message: 'Network error occurred',
                error: 'Please check your internet connection and try again.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all cake designs by specific user ID
export const getCakeDesignsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, include_private = false } = req.query;
        const currentUserId = req.userId; // From JWT token
        const offset = (page - 1) * limit;

        // Validate userId parameter
        if (!userId || isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Valid user ID is required'
            });
        }

        // Build where clause
        const whereClause = { user_id: parseInt(userId) };

        // If requesting another user's designs, only show public ones
        // If requesting own designs, show all (public + private) or based on include_private flag
        if (parseInt(userId) !== currentUserId) {
            whereClause.is_public = true;
        } else if (include_private === 'false') {
            whereClause.is_public = true;
        }

        const { count, rows: cakeDesigns } = await CakeDesign.findAndCountAll({
            attributes: { exclude: ['design_image'] },
            where: whereClause,
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'full_name', 'avatar']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            success: true,
            message: 'Cake designs fetched successfully',
            data: {
                cakeDesigns,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(count / limit),
                    total_items: count,
                    items_per_page: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching cake designs by user ID:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
