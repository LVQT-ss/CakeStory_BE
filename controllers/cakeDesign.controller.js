import CakeDesign from '../models/cake_design.model.js';
import User from '../models/User.model.js';
import { Op } from 'sequelize';
import { storage } from '../utils/firebase.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import OpenAI from 'openai';
import axios from 'axios';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

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

        // Validate required fields
        if (!cake_design_id) {
            return res.status(400).json({
                success: false,
                message: 'cake_design_id is required'
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

        // Find the existing cake design by ID
        const existingCakeDesign = await CakeDesign.findByPk(cake_design_id);
        if (!existingCakeDesign) {
            return res.status(404).json({
                success: false,
                message: 'Cake design not found'
            });
        }

        // Check if user has permission to access this cake design
        // (either it's public or it belongs to the user)
        if (!existingCakeDesign.is_public && existingCakeDesign.user_id !== user_id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only generate AI designs from your own designs or public designs.'
            });
        }

        // Check if AI image already exists
        if (existingCakeDesign.ai_generated) {
            return res.status(400).json({
                success: false,
                message: 'AI image already exists for this cake design. You can only generate one AI image per design.'
            });
        }

        const { design_image, description } = existingCakeDesign;

        // Generate image using OpenAI DALL-E 3
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: description,
            n: 1,
            size: "1024x1024",
        });

        // Get the generated image URL
        const generatedImageUrl = response.data[0].url;
        console.log('AI image generated successfully:', generatedImageUrl);

        // Download the generated image
        const imageResponse = await axios.get(generatedImageUrl, { responseType: 'arraybuffer' });
        const generatedImageBuffer = Buffer.from(imageResponse.data);

        // Generate unique filename for Firebase
        const filename = `ai_cake_designs/${user_id}/${Date.now()}_ai_generated.png`;

        // Upload to Firebase Storage
        const storageRef = ref(storage, filename);
        const metadata = {
            contentType: 'image/png',
            customMetadata: {
                userId: user_id.toString(),
                originalDescription: description || 'A beautiful cake design',
                aiGenerated: 'true',
                model: 'dall-e-3',
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

        res.status(200).json({
            success: true,
            message: 'AI cake design generated successfully',
            data: {
                id: updatedCakeDesign.id,
                user_id: updatedCakeDesign.user_id,
                description: updatedCakeDesign.description,
                design_image: updatedCakeDesign.design_image, // Keep original user image
                created_at: updatedCakeDesign.created_at,
                is_public: updatedCakeDesign.is_public,
                ai_generated: updatedCakeDesign.ai_generated, // Store Firebase URL here
                User: updatedCakeDesign.User
            }
        });

    } catch (error) {
        console.error('Error generating AI cake design:', error);

        // Handle OpenAI specific errors
        if (error.message.includes('OpenAI') || error.message.includes('API key')) {
            return res.status(500).json({
                success: false,
                message: 'Error generating AI image',
                error: 'AI service temporarily unavailable. Please check your OpenAI API key.'
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



