import Post from '../models/post.model.js';
import MemoryPost from '../models/memory_post.model.js';
import PostData from '../models/post_data.model.js';
import sequelize from '../database/db.js';

export const createMemoryPost = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            title,
            description,
            event_date,
            event_type,
            is_public = true,
            media // Array of { image_url?, video_url? }
        } = req.body;

        // Get user ID from verified token
        const user_id = req.userId;

        // Validate required fields
        if (!title) {
            await transaction.rollback();
            return res.status(400).json({
                message: 'Title is required'
            });
        }

        // Create the main post
        const post = await Post.create({
            title,
            description: description || null,
            post_type: 'memory',
            user_id,
            is_public,
            created_at: new Date()
        }, { transaction });

        // Create the memory post record
        await MemoryPost.create({
            post_id: post.id,
            event_date: event_date ? new Date(event_date) : null,
            event_type: event_type || null,
            user_id
        }, { transaction });

        // Add media if provided
        if (media && Array.isArray(media) && media.length > 0) {
            const mediaPromises = media.map(item => {
                if (item.image_url || item.video_url) {
                    return PostData.create({
                        post_id: post.id,
                        image_url: item.image_url || null,
                        video_url: item.video_url || null
                    }, { transaction });
                }
                return null;
            }).filter(Boolean);

            await Promise.all(mediaPromises);
        }

        // Commit transaction
        await transaction.commit();

        // Fetch the created post with all relations
        const createdPost = await Post.findByPk(post.id, {
            include: [
                {
                    model: MemoryPost,
                    attributes: ['event_date', 'event_type']
                },
                {
                    model: PostData,
                    as: 'media',
                    attributes: ['id', 'image_url', 'video_url']
                }
            ]
        });

        res.status(201).json({
            message: 'Memory post created successfully',
            post: createdPost
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error creating memory post:', error);

        res.status(500).json({
            message: 'Error creating memory post',
            error: error.message
        });
    }
}; 