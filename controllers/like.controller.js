import Like from '../models/like.model.js';
import Post from '../models/post.model.js';
import User from '../models/User.model.js';

export const likePost = async (req, res) => {
    try {
        const { post_id } = req.params;
        const user_id = req.userId; // From verifyToken middleware

        // Check if post exists
        const post = await Post.findByPk(post_id);
        if (!post) {
            return res.status(404).json({
                message: 'Post not found'
            });
        }

        // Check if user has already liked the post
        const existingLike = await Like.findOne({
            where: {
                post_id,
                user_id
            }
        });

        if (existingLike) {
            // If like exists, remove it (unlike)
            await existingLike.destroy();
            return res.status(200).json({
                message: 'Post unliked successfully',
                liked: false
            });
        }

        // Create new like
        await Like.create({
            post_id,
            user_id,
            created_at: new Date()
        });

        res.status(201).json({
            message: 'Post liked successfully',
            liked: true
        });

    } catch (error) {
        console.error('Error liking/unliking post:', error);
        res.status(500).json({
            message: 'Error liking/unliking post',
            error: error.message
        });
    }
};

export const getLikesByPostId = async (req, res) => {
    try {
        const { post_id } = req.params;

        // Check if post exists
        const post = await Post.findByPk(post_id);
        if (!post) {
            return res.status(404).json({
                message: 'Post not found'
            });
        }

        // Get all likes for the post with user information
        const likes = await Like.findAll({
            where: {
                post_id,
                design_id: null // Ensure we only get post likes, not design likes
            },
            include: [{
                model: User,
                attributes: ['id', 'username', 'full_name', 'avatar']
            }],
            order: [['created_at', 'DESC']]
        });

        // Get total count
        const likeCount = likes.length;

        res.status(200).json({
            message: 'Post likes retrieved successfully',
            likes: likes,
            total_likes: likeCount
        });

    } catch (error) {
        console.error('Error retrieving post likes:', error);
        res.status(500).json({
            message: 'Error retrieving post likes',
            error: error.message
        });
    }
};

