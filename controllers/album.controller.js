import Post from '../models/post.model.js';
import Album from '../models/album.model.js';
import AlbumPost from '../models/album_post.model.js';
import PostData from '../models/post_data.model.js';
import User from '../models/User.model.js';
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

const getAlbumById = async (req, res) => {
    try {
        const { id } = req.params;

        const album = await Album.findByPk(id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'full_name', 'avatar', 'role', 'created_at', 'address', 'phone_number']
                },
                {
                    model: AlbumPost,
                    include: [
                        {
                            model: Post,
                            include: [
                                {
                                    model: PostData,
                                    as: 'media',
                                    attributes: ['id', 'image_url', 'video_url']
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!album) {
            return res.status(404).json({
                message: 'Album not found'
            });
        }

        res.status(200).json({
            message: 'Album retrieved successfully',
            album
        });
    } catch (error) {
        console.error('Error retrieving album:', error);
        res.status(500).json({
            message: 'Error retrieving album',
            error: error.message
        });
    }
}

const getAlbumPostById = async (req, res) => {
    try {
        const { id } = req.params;

        const albumPost = await AlbumPost.findByPk(id, {
            include: [
                {
                    model: Album,
                    include: [{
                        model: User,
                        attributes: ['id', 'username', 'full_name', 'avatar', 'role', 'created_at']
                    }]
                },
                {
                    model: Post,
                    include: [
                        {
                            model: PostData,
                            as: 'media',
                            attributes: ['id', 'image_url', 'video_url']
                        }
                    ]
                }
            ]
        });

        if (!albumPost) {
            return res.status(404).json({
                message: 'Album post not found'
            });
        }

        res.status(200).json({
            message: 'Album post retrieved successfully',
            albumPost
        });
    } catch (error) {
        console.error('Error retrieving album post:', error);
        res.status(500).json({
            message: 'Error retrieving album post',
            error: error.message
        });
    }
}

const getAllAlbums = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows: albums } = await Album.findAndCountAll({
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'full_name', 'avatar', 'role']
                },
                {
                    model: AlbumPost,
                    include: [{
                        model: Post,
                        include: [{
                            model: PostData,
                            as: 'media',
                            attributes: ['id', 'image_url', 'video_url']
                        }]
                    }]
                }
            ],
            order: [['created_at', 'DESC']],
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            message: 'Albums retrieved successfully',
            data: {
                albums,
                pagination: {
                    total: count,
                    totalPages,
                    currentPage: page,
                    hasMore: page < totalPages
                }
            }
        });
    } catch (error) {
        console.error('Error retrieving albums:', error);
        res.status(500).json({
            message: 'Error retrieving albums',
            error: error.message
        });
    }
}

const updateAlbum = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const user_id = req.userId;

        // Find album and verify ownership
        const album = await Album.findOne({
            where: { id, user_id }
        });

        if (!album) {
            return res.status(404).json({
                message: 'Album not found or access denied'
            });
        }

        if (!name) {
            return res.status(400).json({
                message: 'Name is required'
            });
        }

        // Update album
        await album.update({
            name,
            description: description || null
        });

        // Get updated album with relations
        const updatedAlbum = await Album.findByPk(id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'full_name', 'avatar', 'role']
                },
                {
                    model: AlbumPost,
                    include: [{
                        model: Post,
                        include: [{
                            model: PostData,
                            as: 'media',
                            attributes: ['id', 'image_url', 'video_url']
                        }]
                    }]
                }
            ]
        });

        res.status(200).json({
            message: 'Album updated successfully',
            album: updatedAlbum
        });
    } catch (error) {
        console.error('Error updating album:', error);
        res.status(500).json({
            message: 'Error updating album',
            error: error.message
        });
    }
}

export { createAlbum, createAlbumPost, getAlbumById, getAlbumPostById, getAllAlbums, updateAlbum };