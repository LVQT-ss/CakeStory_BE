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





// Delete picture
export const deletePicture = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.userId;

        // Find the picture
        const picture = await PictureForCakeDesign.findByPk(id);
        if (!picture) {
            return res.status(404).json({
                success: false,
                message: 'Picture not found'
            });
        }

        // Check if user owns this picture
        if (picture.user_id !== user_id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only delete your own pictures.'
            });
        }

        // Delete the picture
        await picture.destroy();

        res.status(200).json({
            success: true,
            message: 'Picture deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting picture:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get pictures by user ID
export const getPicturesByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        // Validate userId parameter
        if (!userId || isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Valid user ID is required'
            });
        }

        const { count, rows: pictures } = await PictureForCakeDesign.findAndCountAll({
            where: { user_id: parseInt(userId) },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'full_name', 'avatar']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            success: true,
            message: 'Pictures by user fetched successfully',
            data: {
                pictures,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(count / limit),
                    total_items: count,
                    items_per_page: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching pictures by user ID:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
