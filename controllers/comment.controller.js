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

export const updateComment = async (req, res) => {
    try {
        const { comment_id } = req.params;
        const { content } = req.body;
        const user_id = req.userId;

        // Validate required fields
        if (!content) {
            return res.status(400).json({
                message: 'Comment content is required'
            });
        }

        // Find the comment
        const comment = await Comment.findByPk(comment_id);
        if (!comment) {
            return res.status(404).json({
                message: 'Comment not found'
            });
        }

        // Check if user owns the comment
        if (comment.user_id !== user_id) {
            return res.status(403).json({
                message: 'You can only update your own comments'
            });
        }

        // Update comment
        await comment.update({
            content,
            updated_at: new Date()
        });

        // Get updated comment with user info
        const updatedComment = await Comment.findOne({
            where: { id: comment_id },
            include: [{
                model: User,
                attributes: ['id', 'username', 'full_name', 'avatar']
            }]
        });

        res.status(200).json({
            message: 'Comment updated successfully',
            comment: updatedComment
        });

    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({
            message: 'Error updating comment',
            error: error.message
        });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { comment_id } = req.params;
        const user_id = req.userId;

        // Find the comment
        const comment = await Comment.findByPk(comment_id);
        if (!comment) {
            return res.status(404).json({
                message: 'Comment not found'
            });
        }

        // Check if user owns the comment
        if (comment.user_id !== user_id) {
            return res.status(403).json({
                message: 'You can only delete your own comments'
            });
        }

        // Delete comment
        await comment.destroy();

        res.status(200).json({
            message: 'Comment deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({
            message: 'Error deleting comment',
            error: error.message
        });
    }
};

export const replyComment = async (req, res) => {
    try {
        const { id } = req.params; // id is the parent comment id
        const { content } = req.body;
        const user_id = req.userId;

        // Validate required fields
        if (!content) {
            return res.status(400).json({
                message: 'Reply content is required'
            });
        }

        // Find the parent comment
        const parentComment = await Comment.findByPk(id);
        if (!parentComment) {
            return res.status(404).json({
                message: 'Parent comment not found'
            });
        }

        // Create reply comment (must use same post_id as parent)
        const reply = await Comment.create({
            content,
            post_id: parentComment.post_id,
            user_id,
            parent_comment_id: id,
            created_at: new Date()
        });

        // Get reply with user info
        const replyWithUser = await Comment.findOne({
            where: { id: reply.id },
            include: [{
                model: User,
                attributes: ['id', 'username', 'full_name', 'avatar']
            }]
        });

        res.status(201).json({
            message: 'Reply created successfully',
            comment: replyWithUser
        });
    } catch (error) {
        console.error('Error replying to comment:', error);
        res.status(500).json({
            message: 'Error replying to comment',
            error: error.message
        });
    }
};
