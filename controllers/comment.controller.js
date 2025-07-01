import Comment from '../models/comment.model.js';
import Post from '../models/post.model.js';
import User from '../models/User.model.js';

export const createComment = async (req, res) => {
    try {
        const { post_id } = req.params;
        const { content } = req.body;
        const user_id = req.userId; // From verifyToken middleware

        // Validate required fields
        if (!content) {
            return res.status(400).json({
                message: 'Comment content is required'
            });
        }

        // Check if post exists
        const post = await Post.findByPk(post_id);
        if (!post) {
            return res.status(404).json({
                message: 'Post not found'
            });
        }

        // Create comment
        const comment = await Comment.create({
            content,
            post_id,
            user_id,
            created_at: new Date()
        });

        // Get comment with user info
        const commentWithUser = await Comment.findOne({
            where: { id: comment.id },
            include: [{
                model: User,
                attributes: ['id', 'username', 'full_name', 'avatar']
            }]
        });

        res.status(201).json({
            message: 'Comment created successfully',
            comment: commentWithUser
        });

    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({
            message: 'Error creating comment',
            error: error.message
        });
    }
};

export const getCommentsByPostId = async (req, res) => {
    try {
        const { post_id } = req.params;

        // Check if post exists
        const post = await Post.findByPk(post_id);
        if (!post) {
            return res.status(404).json({
                message: 'Post not found'
            });
        }

        // Get all comments for the post with user information
        const comments = await Comment.findAll({
            where: { post_id },
            include: [{
                model: User,
                attributes: ['id', 'username', 'full_name', 'avatar']
            }],
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            message: 'Comments retrieved successfully',
            comments: comments,
            total_comments: comments.length
        });

    } catch (error) {
        console.error('Error retrieving comments:', error);
        res.status(500).json({
            message: 'Error retrieving comments',
            error: error.message
        });
    }
};

