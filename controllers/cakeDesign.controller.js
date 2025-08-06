import CakeDesign from '../models/cake_design.model.js';
import User from '../models/User.model.js';
import { Op } from 'sequelize';

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



