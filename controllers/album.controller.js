import Post from '../models/post.model.js';
import Album from '../models/album.model.js';
import AlbumPost from '../models/album_post.model.js';
import PostData from '../models/post_data.model.js';
import sequelize from '../database/db.js';

const createAlbum = async (req, res) => {
    try {
        const { name, description } = req.body;
        const user_id = req.userId;

        if (!name) {
            return res.status(400).json({
                message: 'Name is required'
            });
        }

        const album = await Album.create({
            user_id,
            name,
            description: description || null,
            created_at: new Date()
        });

        res.status(201).json({
            message: 'Album created successfully',
            album
        });

    } catch (error) {
        console.error('Error creating album:', error);
        res.status(500).json({
            message: 'Error creating album',
            error: error.message
        });
    }
}

const createAlbumPost = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            album_id,
            title,
            description,
            is_public = true,
            media // Array of { image_url?, video_url? }
        } = req.body;

        const user_id = req.userId;

        if (!title || !album_id) {
            await transaction.rollback();
            return res.status(400).json({
                message: 'Title and album_id are required'
            });
        }

        // Verify album exists and belongs to user
        const album = await Album.findOne({
            where: { id: album_id, user_id }
        });

        if (!album) {
            await transaction.rollback();
            return res.status(404).json({
                message: 'Album not found or access denied'
            });
        }

        // Create the main post
        const post = await Post.create({
            title,
            description: description || null,
            post_type: 'album',
            user_id,
            is_public,
            created_at: new Date()
        }, { transaction });

        // Create the Album post record
        await AlbumPost.create({
            post_id: post.id,
            album: album_id,
            name: title,
            description: description || null,
            created_at: new Date()
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

        await transaction.commit();

        // Fetch the created post with all relations
        const createdPost = await Post.findByPk(post.id, {
            include: [
                {
                    model: AlbumPost,
                    attributes: ['id', 'name', 'description', 'created_at'],
                    include: [{
                        model: Album,
                        attributes: ['id', 'name', 'description']
                    }]
                },
                {
                    model: PostData,
                    as: 'media',
                    attributes: ['id', 'image_url', 'video_url']
                }
            ]
        });

        res.status(201).json({
            message: 'Album post created successfully',
            post: createdPost
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error creating Album post:', error);

        res.status(500).json({
            message: 'Error creating Album post',
            error: error.message
        });
    }
}

export { createAlbum, createAlbumPost };