import Like from '../models/like.model.js';
import Post from '../models/post.model.js';

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
