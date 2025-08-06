import CakeDesign from '../models/cake_design.model.js';
import User from '../models/User.model.js';

// Create a new cake design
export const createCakeDesign = async (req, res) => {
    try {
        const { description, design_image, is_public, is_ai_generated } = req.body;
        const user_id = req.userId; // From JWT token

        // Validate required fields
        if (!design_image) {
            return res.status(400).json({
                success: false,
                message: 'design_image is required'
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
            design_image,
            is_public: is_public !== undefined ? is_public : true,
            is_ai_generated: is_ai_generated !== undefined ? is_ai_generated : false
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



