import PictureForCakeDesign from '../models/picture_for_cake_design.model.js';
import User from '../models/User.model.js';


// Create a new picture for cake design
export const createPicture = async (req, res) => {
    try {
        const { title, imageUrl } = req.body;
        const user_id = req.userId; // From JWT token

        // Validate required fields
        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'imageUrl is required'
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

        // Create picture record
        const picture = await PictureForCakeDesign.create({
            user_id,
            title: title || 'Untitled',
            imageUrl: imageUrl
        });

        res.status(201).json({
            success: true,
            message: 'Picture for cake design created successfully',
            data: picture
        });
    } catch (error) {
        console.error('Error creating picture for cake design:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};




