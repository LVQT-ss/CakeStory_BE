import Post from '../models/post.model.js';
import User from '../models/User.model.js';
import MemoryPost from '../models/memory_post.model.js';
import PostData from '../models/post_data.model.js';
import Like from '../models/like.model.js';
import Comment from '../models/comment.model.js';
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

export const getMemoryPostById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the memory post by ID with all related data
        const memoryPost = await Post.findOne({
            where: {
                id: id,
                post_type: 'memory',
                is_public: true // Only return public memory posts for open access
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: [
                        'id',
                        'username',
                        'full_name',
                        'avatar',
                        'role',
                        'created_at',
                        'address',
                        'phone_number'
                    ] // Include comprehensive user info while excluding sensitive data (password, email, firebase_uid)
                },
                {
                    model: MemoryPost,
                    attributes: ['event_date', 'event_type']
                },
                {
                    model: PostData,
                    as: 'media',
                    attributes: ['id', 'image_url', 'video_url']
                },
                {
                    model: Like,
                    attributes: [],
                    required: false
                },
                {
                    model: Comment,
                    attributes: [],
                    required: false
                }
            ]
        });

        if (!memoryPost) {
            return res.status(404).json({
                message: 'Memory post not found or not publicly accessible'
            });
        }

        // Count likes and comments
        const [likeCount, commentCount] = await Promise.all([
            Like.count({
                where: {
                    post_id: id,
                    design_id: null
                }
            }),
            Comment.count({
                where: {
                    post_id: id
                }
            })
        ]);

        // Add counts to the response
        const postWithCounts = {
            ...memoryPost.toJSON(),
            total_likes: likeCount,
            total_comments: commentCount
        };

        res.status(200).json({
            message: 'Memory post retrieved successfully',
            post: postWithCounts
        });

    } catch (error) {
        console.error('Error retrieving memory post:', error);
        res.status(500).json({
            message: 'Error retrieving memory post',
            error: error.message
        });
    }
};

export const updateMemoryPostById = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const {
            title,
            description,
            event_date,
            event_type,
            is_public,
            media // Array of { image_url?, video_url? }
        } = req.body;

        // Get user ID from verified token
        const user_id = req.userId;
        const user_role = req.role;

        // Find the existing memory post
        const existingPost = await Post.findOne({
            where: {
                id: id,
                post_type: 'memory'
            },
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

        if (!existingPost) {
            await transaction.rollback();
            return res.status(404).json({
                message: 'Memory post not found'
            });
        }

        // Authorization: Only post owner or admin can update
        if (existingPost.user_id !== user_id && user_role !== 'admin') {
            await transaction.rollback();
            return res.status(403).json({
                message: 'You can only update your own memory posts'
            });
        }

        // Update the main post fields if provided
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (is_public !== undefined) updateData.is_public = is_public;

        if (Object.keys(updateData).length > 0) {
            await existingPost.update(updateData, { transaction });
        }

        // Update memory post specific fields if provided
        const memoryUpdateData = {};
        if (event_date !== undefined) memoryUpdateData.event_date = event_date ? new Date(event_date) : null;
        if (event_type !== undefined) memoryUpdateData.event_type = event_type;

        if (Object.keys(memoryUpdateData).length > 0) {
            await MemoryPost.update(memoryUpdateData, {
                where: { post_id: id },
                transaction
            });
        }

        // Handle media updates if provided
        if (media !== undefined && Array.isArray(media)) {
            // Delete existing media
            await PostData.destroy({
                where: { post_id: id },
                transaction
            });

            // Add new media if any
            if (media.length > 0) {
                const mediaPromises = media.map(item => {
                    if (item.image_url || item.video_url) {
                        return PostData.create({
                            post_id: id,
                            image_url: item.image_url || null,
                            video_url: item.video_url || null
                        }, { transaction });
                    }
                    return null;
                }).filter(Boolean);

                await Promise.all(mediaPromises);
            }
        }

        // Commit transaction
        await transaction.commit();

        // Fetch the updated post with all relations
        const updatedPost = await Post.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: [
                        'id',
                        'username',
                        'full_name',
                        'avatar',
                        'role',
                        'created_at',
                        'address',
                        'phone_number'
                    ]
                },
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

        res.status(200).json({
            message: 'Memory post updated successfully',
            post: updatedPost
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error updating memory post:', error);

        res.status(500).json({
            message: 'Error updating memory post',
            error: error.message
        });
    }
};

export const updateMemoryPostVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_public } = req.body;

        // Get user ID from verified token
        const user_id = req.userId;
        const user_role = req.role;

        // Validate is_public parameter
        if (typeof is_public !== 'boolean') {
            return res.status(400).json({
                message: 'is_public must be a boolean value (true or false)'
            });
        }

        // Find the existing memory post
        const existingPost = await Post.findOne({
            where: {
                id: id,
                post_type: 'memory'
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'full_name']
                }
            ]
        });

        if (!existingPost) {
            return res.status(404).json({
                message: 'Memory post not found'
            });
        }

        // Authorization: Only post owner or admin can update visibility
        if (existingPost.user_id !== user_id && user_role !== 'admin') {
            return res.status(403).json({
                message: 'You can only update visibility of your own memory posts'
            });
        }

        // Update the is_public field
        await existingPost.update({ is_public });

        res.status(200).json({
            message: `Memory post visibility updated to ${is_public ? 'public' : 'private'} successfully`,
            post: {
                id: existingPost.id,
                title: existingPost.title,
                is_public: is_public,
                user: {
                    id: existingPost.user.id,
                    username: existingPost.user.username,
                    full_name: existingPost.user.full_name
                }
            }
        });

    } catch (error) {
        console.error('Error updating memory post visibility:', error);
        res.status(500).json({
            message: 'Error updating memory post visibility',
            error: error.message
        });
    }
};

export const deleteMemoryPostById = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;

        // Get user ID from verified token
        const user_id = req.userId;

        // Find the existing memory post
        const existingPost = await Post.findOne({
            where: {
                id: id,
                post_type: 'memory'
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'full_name']
                },
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

        if (!existingPost) {
            await transaction.rollback();
            return res.status(404).json({
                message: 'Memory post not found'
            });
        }

        // Authorization: Only post owner can delete
        if (existingPost.user_id !== user_id) {
            await transaction.rollback();
            return res.status(403).json({
                message: 'You can only delete your own memory posts'
            });
        }

        // Store post info for response before deletion
        const postInfo = {
            id: existingPost.id,
            title: existingPost.title,
            user: {
                id: existingPost.user.id,
                username: existingPost.user.username,
                full_name: existingPost.user.full_name
            }
        };

        // Delete in correct order due to foreign key constraints
        // 1. Delete PostData (media) first
        await PostData.destroy({
            where: { post_id: id },
            transaction
        });

        // 2. Delete MemoryPost record
        await MemoryPost.destroy({
            where: { post_id: id },
            transaction
        });

        // 3. Finally delete the main Post
        await existingPost.destroy({ transaction });

        // Commit transaction
        await transaction.commit();

        res.status(200).json({
            message: 'Memory post deleted successfully',
            deletedPost: postInfo
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting memory post:', error);

        res.status(500).json({
            message: 'Error deleting memory post',
            error: error.message
        });
    }
};

export const getAllMemoryPosts = async (req, res) => {
    try {
        const memoryPosts = await MemoryPost.findAll({
            include: [
                {
                    model: Post,
                    where: {
                        is_public: true
                    },
                    attributes: [
                        'id',
                        'title',
                        'description',
                        'post_type',
                        'is_public',
                        'created_at'
                    ],
                    include: [
                        {
                            model: PostData,
                            as: 'media',
                            attributes: ['id', 'image_url', 'video_url'],
                            order: [['id', 'ASC']],
                            separate: true
                        },
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'username', 'full_name', 'avatar', 'role']
                        },
                        {
                            model: Like,
                            attributes: [],
                            required: false
                        },
                        {
                            model: Comment,
                            attributes: [],
                            required: false
                        }
                    ]
                }
            ],
            attributes: ['event_date', 'event_type'],
            order: [[Post, 'created_at', 'ASC']]
        });

        // Count likes and comments for each post
        const postsWithLikesAndComments = await Promise.all(memoryPosts.map(async (memoryPost) => {
            const [likeCount, commentCount] = await Promise.all([
                Like.count({
                    where: {
                        post_id: memoryPost.Post.id,
                        design_id: null
                    }
                }),
                Comment.count({
                    where: {
                        post_id: memoryPost.Post.id
                    }
                })
            ]);

            return {
                ...memoryPost.toJSON(),
                Post: {
                    ...memoryPost.Post.toJSON(),
                    total_likes: likeCount,
                    total_comments: commentCount
                }
            };
        }));

        res.status(200).json({
            message: 'Memory posts retrieved successfully',
            posts: postsWithLikesAndComments
        });

    } catch (error) {
        console.error('Error retrieving memory posts:', error);
        res.status(500).json({
            message: 'Error retrieving memory posts',
            error: error.message
        });
    }
};

export const getAllMemoryPostsByUserId = async (req, res) => {

    try {
        const { userId } = req.params;

        // Validate user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const memoryPosts = await MemoryPost.findAll({
            include: [
                {
                    model: Post,
                    where: {
                        user_id: userId
                    },
                    attributes: [
                        'id',
                        'title',
                        'description',
                        'post_type',
                        'is_public',
                        'created_at'
                    ],
                    include: [
                        {
                            model: PostData,
                            as: 'media',
                            attributes: ['id', 'image_url', 'video_url'],
                            order: [['id', 'ASC']]
                        },
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'username', 'full_name', 'avatar', 'role']
                        },
                        {
                            model: Like,
                            attributes: [],
                            required: false
                        },
                        {
                            model: Comment,
                            attributes: [],
                            required: false
                        }
                    ]
                }
            ],
            attributes: ['event_date', 'event_type'],
            order: [[Post, 'created_at', 'DESC']]
        });

        // Count likes and comments for each post
        const postsWithLikesAndComments = await Promise.all(memoryPosts.map(async (memoryPost) => {
            const [likeCount, commentCount] = await Promise.all([
                Like.count({
                    where: {
                        post_id: memoryPost.Post.id,
                        design_id: null
                    }
                }),
                Comment.count({
                    where: {
                        post_id: memoryPost.Post.id
                    }
                })
            ]);

            return {
                ...memoryPost.toJSON(),
                Post: {
                    ...memoryPost.Post.toJSON(),
                    total_likes: likeCount,
                    total_comments: commentCount
                }
            };
        }));

        res.status(200).json({
            message: 'User memory posts retrieved successfully',
            posts: postsWithLikesAndComments
        });

    } catch (error) {
        console.error('Error retrieving user memory posts:', error);
        res.status(500).json({
            message: 'Error retrieving user memory posts',
            error: error.message
        });
    }
};

export const getAllMemoryPostsPaginated = async (req, res) => {
    try {
        // Get page and limit from query parameters, with defaults
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 10); // Max 10 items per page

        // Validate page number
        if (page < 1) {
            return res.status(400).json({
                message: "Page number must be greater than 0"
            });
        }

        // Calculate offset
        const offset = (page - 1) * limit;

        // Get total count of memory posts
        const totalPosts = await Post.count({
            where: {
                post_type: 'memory',
                is_public: true
            },
            include: [{
                model: MemoryPost,
                required: true
            }]
        });

        // Calculate total pages
        const totalPages = Math.ceil(totalPosts / limit);

        // Validate page number against total pages
        if (page > totalPages && totalPosts > 0) {
            return res.status(400).json({
                message: `Page number ${page} exceeds total pages ${totalPages}`
            });
        }

        // Get paginated memory posts
        const posts = await Post.findAll({
            where: {
                post_type: 'memory',
                is_public: true
            },
            attributes: ['id', 'title', 'description', 'post_type', 'is_public', 'created_at'],
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'full_name', 'avatar', 'role']
                },
                {
                    model: MemoryPost,
                    attributes: ['event_date', 'event_type'],
                    required: true
                },
                {
                    model: PostData,
                    as: 'media',
                    attributes: ['id', 'image_url', 'video_url'],
                    required: false
                }
            ],
            order: [['created_at', 'ASC']],
            limit: limit,
            offset: offset,
            distinct: true
        });

        // Get likes and comments count for each post
        const postsWithCounts = await Promise.all(posts.map(async (post) => {
            const [likesCount, commentsCount] = await Promise.all([
                Like.count({ where: { post_id: post.id } }),
                Comment.count({ where: { post_id: post.id } })
            ]);

            return {
                id: post.id,
                title: post.title,
                description: post.description,
                post_type: post.post_type,
                is_public: post.is_public,
                created_at: post.created_at,
                user: post.user,
                MemoryPost: post.MemoryPost,
                media: post.media,
                total_likes: likesCount,
                total_comments: commentsCount
            };
        }));

        return res.status(200).json({
            message: "Memory posts retrieved successfully",
            currentPage: page,
            totalPages: totalPages,
            totalPosts: totalPosts,
            posts: postsWithCounts
        });

    } catch (error) {
        console.error('Error in getAllMemoryPostsPaginated:', error);
        return res.status(500).json({
            message: "Error retrieving memory posts",
            error: error.message
        });
    }
};