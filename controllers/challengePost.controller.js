import sequelize from '../database/db.js';
import ChallengePost from '../models/challenge_post.model.js';
import Post from '../models/post.model.js';
import PostData from '../models/post_data.model.js';
import Challenge from '../models/challenge.model.js';
import User from '../models/User.model.js';
import Like from '../models/like.model.js';
import Comment from '../models/comment.model.js';

// Create Challenge Post
export const createChallengePost = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      title,
      description,
      challenge_id,
      is_design = false,
      is_public = true,
      media
    } = req.body;

    const user_id = req.userId; // from verifyToken middleware

    if (!title || !challenge_id) {
      throw new Error('Title and challenge_id are required');
    }

    // Check if user already has an active challenge post
    const existingChallengePost = await ChallengePost.findOne({
      where: {
        user_id,
        is_active: true
      },
      transaction
    });

    if (existingChallengePost) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'You already have an active challenge post. Only one challenge post per user is allowed.' 
      });
    }

    const challenge = await Challenge.findByPk(challenge_id);
    if (!challenge) throw new Error('Challenge not found');

    const post = await Post.create({
      title,
      description: description || null,
      post_type: 'challenge',
      user_id,
      is_public,
      created_at: new Date()
    }, { transaction });

    await ChallengePost.create({
      post_id: post.id,
      challenge_id,
      challengeName: challenge.title,
      user_id,
      is_challenge: true,
      is_design,
      is_active: true,
      created_at: new Date()
    }, { transaction });

    // Handle media
    if (Array.isArray(media) && media.length > 0) {
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

    const createdPost = await Post.findByPk(post.id, {
      include: [
        {
          model: ChallengePost,
          as: 'challengePost'
        },
        {
          model: PostData,
          as: 'media',
          attributes: ['id', 'image_url', 'video_url']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'full_name', 'avatar', 'role']
        }
      ]
    });

    return res.status(201).json({
      message: 'Challenge post created successfully',
      post: createdPost
    });

  } catch (err) {
    if (!transaction.finished) await transaction.rollback();
    console.error('Error creating challenge post:', err);
    return res.status(500).json({ message: 'Error creating challenge post', error: err.message });
  }
};

// Get all challenge posts
export const getAllChallengePosts = async (req, res) => {
  try {
    const posts = await ChallengePost.findAll({
      where: {
        is_active: true
      },
      include: [
        {
          model: Post,
          as: 'post',
          where: {
            is_public: true
          },
          include: [
            { 
              model: PostData, 
              as: 'media',
              attributes: ['id', 'image_url', 'video_url']
            },
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'full_name', 'avatar', 'role']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Count likes and comments for each post
    const postsWithCounts = await Promise.all(posts.map(async (challengePost) => {
      const [likeCount, commentCount] = await Promise.all([
        Like.count({
          where: {
            post_id: challengePost.post_id,
            design_id: null
          }
        }),
        Comment.count({
          where: {
            post_id: challengePost.post_id
          }
        })
      ]);

      return {
        ...challengePost.toJSON(),
        post: {
          ...challengePost.post.toJSON(),
          total_likes: likeCount,
          total_comments: commentCount
        }
      };
    }));

    res.status(200).json({ 
      message: 'Challenge posts retrieved', 
      posts: postsWithCounts 
    });
  } catch (err) {
    console.error('Error fetching challenge posts:', err);
    res.status(500).json({ message: 'Error fetching challenge posts', error: err.message });
  }
};

// Get challenge post by post_id
export const getChallengePostById = async (req, res) => {
  try {
    const { post_id } = req.params;
    const post = await ChallengePost.findOne({
      where: {
        post_id,
        is_active: true
      },
      include: [
        {
          model: Post,
          as: 'post',
          include: [
            { 
              model: PostData, 
              as: 'media',
              attributes: ['id', 'image_url', 'video_url']
            },
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'full_name', 'avatar', 'role']
            }
          ]
        }
      ]
    });

    if (!post) return res.status(404).json({ message: 'Challenge post not found' });

    // Count likes and comments
    const [likeCount, commentCount] = await Promise.all([
      Like.count({
        where: {
          post_id: post_id,
          design_id: null
        }
      }),
      Comment.count({
        where: {
          post_id: post_id
        }
      })
    ]);

    const postWithCounts = {
      ...post.toJSON(),
      post: {
        ...post.post.toJSON(),
        total_likes: likeCount,
        total_comments: commentCount
      }
    };

    res.status(200).json({ message: 'Challenge post retrieved', post: postWithCounts });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving challenge post', error: err.message });
  }
};

// Get challenge posts by user ID
export const getChallengePostsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const posts = await ChallengePost.findAll({
      where: {
        user_id: userId,
        is_active: true
      },
      include: [
        {
          model: Post,
          as: 'post',
          include: [
            { 
              model: PostData, 
              as: 'media',
              attributes: ['id', 'image_url', 'video_url']
            },
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'full_name', 'avatar', 'role']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Count likes and comments for each post
    const postsWithCounts = await Promise.all(posts.map(async (challengePost) => {
      const [likeCount, commentCount] = await Promise.all([
        Like.count({
          where: {
            post_id: challengePost.post_id,
            design_id: null
          }
        }),
        Comment.count({
          where: {
            post_id: challengePost.post_id
          }
        })
      ]);

      return {
        ...challengePost.toJSON(),
        post: {
          ...challengePost.post.toJSON(),
          total_likes: likeCount,
          total_comments: commentCount
        }
      };
    }));

    res.status(200).json({ 
      message: 'User challenge posts retrieved successfully', 
      posts: postsWithCounts 
    });
  } catch (err) {
    console.error('Error fetching user challenge posts:', err);
    res.status(500).json({ message: 'Error fetching user challenge posts', error: err.message });
  }
};

// Update challenge post
export const updateChallengePost = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { post_id } = req.params;
    const {
      title, 
      description, 
      is_public,
      is_design,
      media
    } = req.body;

    const user_id = req.userId;
    const user_role = req.role;

    const challengePost = await ChallengePost.findOne({
      where: {
        post_id,
        is_active: true
      },
      include: [{ model: Post, as: 'post' }],
      transaction
    });

    if (!challengePost) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Challenge post not found' });
    }

    // Authorization: Only post owner or admin can update
    if (challengePost.user_id !== user_id && user_role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({
        message: 'You can only update your own challenge posts'
      });
    }

    await challengePost.update({ is_design }, { transaction });

    if (challengePost.post) {
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (is_public !== undefined) updateData.is_public = is_public;

      if (Object.keys(updateData).length > 0) {
        await challengePost.post.update(updateData, { transaction });
      }
    }

    // Handle media updates if provided
    if (media !== undefined && Array.isArray(media)) {
      // Delete existing media
      await PostData.destroy({
        where: { post_id: post_id },
        transaction
      });

      // Add new media if any
      if (media.length > 0) {
        const mediaPromises = media.map(item => {
          if (item.image_url || item.video_url) {
            return PostData.create({
              post_id: post_id,
              image_url: item.image_url || null,
              video_url: item.video_url || null
            }, { transaction });
          }
          return null;
        }).filter(Boolean);

        await Promise.all(mediaPromises);
      }
    }

    await transaction.commit();

    // Fetch updated post
    const updatedPost = await ChallengePost.findOne({
      where: { post_id },
      include: [
        {
          model: Post,
          as: 'post',
          include: [
            { 
              model: PostData, 
              as: 'media',
              attributes: ['id', 'image_url', 'video_url']
            },
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'full_name', 'avatar', 'role']
            }
          ]
        }
      ]
    });

    return res.status(200).json({ message: 'Challenge post updated', post: updatedPost });
  } catch (err) {
    if (!transaction.finished) await transaction.rollback();
    res.status(500).json({ message: 'Error updating challenge post', error: err.message });
  }
};

// Soft delete challenge post
export const deleteChallengePost = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { post_id } = req.params;
    const user_id = req.userId;
    const user_role = req.role;

    const challengePost = await ChallengePost.findOne({
      where: {
        post_id,
        is_active: true
      },
      include: [
        {
          model: Post,
          as: 'post',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'full_name']
            }
          ]
        }
      ],
      transaction
    });

    if (!challengePost) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Challenge post not found' });
    }

    // Authorization: Only post owner or admin can delete
    if (challengePost.user_id !== user_id && user_role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({
        message: 'You can only delete your own challenge posts'
      });
    }

    // Store post info for response before deletion
    const postInfo = {
      id: challengePost.post_id,
      title: challengePost.post.title,
      user: {
        id: challengePost.post.user.id,
        username: challengePost.post.user.username,
        full_name: challengePost.post.user.full_name
      }
    };

    // Soft delete: set is_active to false and add deleted_at timestamp
    await challengePost.update({
      is_active: false,
      deleted_at: new Date()
    }, { transaction });

    await transaction.commit();

    res.status(200).json({
      message: 'Challenge post deleted successfully',
      deletedPost: postInfo
    });
  } catch (err) {
    if (!transaction.finished) await transaction.rollback();
    console.error('Error deleting challenge post:', err);
    res.status(500).json({ message: 'Error deleting challenge post', error: err.message });
  }
};

// Like challenge post
export const likeChallengePost = async (req, res) => {
  try {
    const { post_id } = req.params;
    const user_id = req.userId;

    // Check if challenge post exists and is active
    const challengePost = await ChallengePost.findOne({
      where: {
        post_id,
        is_active: true
      }
    });

    if (!challengePost) {
      return res.status(404).json({ message: 'Challenge post not found' });
    }

    // Check if user already liked this post
    const existingLike = await Like.findOne({
      where: {
        user_id,
        post_id,
        design_id: null
      }
    });

    if (existingLike) {
      return res.status(400).json({ message: 'You have already liked this post' });
    }

    // Create like
    await Like.create({
      user_id,
      post_id,
      design_id: null
    });

    // Get updated like count
    const likeCount = await Like.count({
      where: {
        post_id,
        design_id: null
      }
    });

    res.status(201).json({
      message: 'Post liked successfully',
      total_likes: likeCount
    });
  } catch (err) {
    console.error('Error liking challenge post:', err);
    res.status(500).json({ message: 'Error liking challenge post', error: err.message });
  }
};

// Unlike challenge post
export const unlikeChallengePost = async (req, res) => {
  try {
    const { post_id } = req.params;
    const user_id = req.userId;

    // Check if challenge post exists and is active
    const challengePost = await ChallengePost.findOne({
      where: {
        post_id,
        is_active: true
      }
    });

    if (!challengePost) {
      return res.status(404).json({ message: 'Challenge post not found' });
    }

    // Find and remove like
    const existingLike = await Like.findOne({
      where: {
        user_id,
        post_id,
        design_id: null
      }
    });

    if (!existingLike) {
      return res.status(400).json({ message: 'You have not liked this post' });
    }

    await existingLike.destroy();

    // Get updated like count
    const likeCount = await Like.count({
      where: {
        post_id,
        design_id: null
      }
    });

    res.status(200).json({
      message: 'Post unliked successfully',
      total_likes: likeCount
    });
  } catch (err) {
    console.error('Error unliking challenge post:', err);
    res.status(500).json({ message: 'Error unliking challenge post', error: err.message });
  }
};

// Add comment to challenge post
export const addCommentToChallengePost = async (req, res) => {
  try {
    const { post_id } = req.params;
    const { content, parent_comment_id } = req.body;
    const user_id = req.userId;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    // Check if challenge post exists and is active
    const challengePost = await ChallengePost.findOne({
      where: {
        post_id,
        is_active: true
      }
    });

    if (!challengePost) {
      return res.status(404).json({ message: 'Challenge post not found' });
    }

    // If parent_comment_id is provided, verify it exists
    if (parent_comment_id) {
      const parentComment = await Comment.findOne({
        where: {
          id: parent_comment_id,
          post_id
        }
      });

      if (!parentComment) {
        return res.status(400).json({ message: 'Parent comment not found' });
      }
    }

    // Create comment
    const comment = await Comment.create({
      user_id,
      post_id,
      parent_comment_id: parent_comment_id || null,
      content: content.trim()
    });

    // Fetch the created comment with user info
    const createdComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'full_name', 'avatar']
        }
      ]
    });

    // Get updated comment count
    const commentCount = await Comment.count({
      where: { post_id }
    });

    res.status(201).json({
      message: 'Comment added successfully',
      comment: createdComment,
      total_comments: commentCount
    });
  } catch (err) {
    console.error('Error adding comment to challenge post:', err);
    res.status(500).json({ message: 'Error adding comment', error: err.message });
  }
};

// Get comments for challenge post
export const getChallengePostComments = async (req, res) => {
  try {
    const { post_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const offset = (page - 1) * limit;

    // Check if challenge post exists and is active
    const challengePost = await ChallengePost.findOne({
      where: {
        post_id,
        is_active: true
      }
    });

    if (!challengePost) {
      return res.status(404).json({ message: 'Challenge post not found' });
    }

    // Get total count
    const totalComments = await Comment.count({
      where: { 
        post_id,
        parent_comment_id: null 
      }
    });

    // Get comments with pagination
    const comments = await Comment.findAll({
      where: { 
        post_id,
        parent_comment_id: null 
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'full_name', 'avatar']
        },
        {
          model: Comment,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'full_name', 'avatar']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    const totalPages = Math.ceil(totalComments / limit);

    res.status(200).json({
      message: 'Comments retrieved successfully',
      comments,
      pagination: {
        currentPage: page,
        totalPages,
        totalComments,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    console.error('Error getting challenge post comments:', err);
    res.status(500).json({ message: 'Error retrieving comments', error: err.message });
  }
};

export const getChallengePostsByChallengeId = async (req, res) => {
  try {
    const { challenge_id } = req.params;

    // Kiểm tra challenge có tồn tại không
    const challenge = await Challenge.findByPk(challenge_id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const posts = await ChallengePost.findAll({
      where: {
        challenge_id,
        is_active: true
      },
      include: [
        {
          model: Post,
          as: 'post',
          where: {
            is_public: true
          },
          include: [
            {
              model: PostData,
              as: 'media',
              attributes: ['id', 'image_url', 'video_url']
            },
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'full_name', 'avatar', 'role']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Đếm số lượt like và comment cho mỗi bài
    const postsWithCounts = await Promise.all(posts.map(async (challengePost) => {
      const [likeCount, commentCount] = await Promise.all([
        Like.count({
          where: {
            post_id: challengePost.post_id,
            design_id: null
          }
        }),
        Comment.count({
          where: {
            post_id: challengePost.post_id
          }
        })
      ]);

      return {
        ...challengePost.toJSON(),
        post: {
          ...challengePost.post.toJSON(),
          total_likes: likeCount,
          total_comments: commentCount
        }
      };
    }));

    res.status(200).json({
      message: 'Challenge posts retrieved successfully by challenge_id',
      posts: postsWithCounts
    });
  } catch (err) {
    console.error('Error fetching challenge posts by challenge_id:', err);
    res.status(500).json({
      message: 'Error fetching challenge posts by challenge_id',
      error: err.message
    });
  }
};

export const getLeaderBoard = async (req, res) => {
  try {
    const { challenge_id } = req.query;

    // 1. Bắt buộc phải có challenge_id
    if (!challenge_id) {
      return res.status(400).json({
        message: "challenge_id is required"
      });
    }

    // 2. Kiểm tra challenge có tồn tại không
    const challenge = await Challenge.findByPk(challenge_id);
    if (!challenge) {
      return res.status(404).json({
        message: `Challenge with ID ${challenge_id} not found`
      });
    }

    // 3. Lấy các challenge post của challenge này
    const posts = await ChallengePost.findAll({
      where: { challenge_id, is_active: true },
      include: [
        {
          model: Post,
          as: 'post',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'full_name', 'avatar', 'role']
            },
            {
              model: PostData,
              as: 'media',
              attributes: ['id', 'image_url', 'video_url']
            }
          ]
        }
      ]
    });

    // 4. Tính like & comment cho từng post
    const postsWithLikes = await Promise.all(posts.map(async (challengePost) => {
      const [likeCount, commentCount] = await Promise.all([
        Like.count({
          where: {
            post_id: challengePost.post_id,
            design_id: null
          }
        }),
        Comment.count({
          where: {
            post_id: challengePost.post_id
          }
        })
      ]);

      return {
        ...challengePost.toJSON(),
        post: {
          ...challengePost.post.toJSON(),
          total_likes: likeCount,
          total_comments: commentCount
        },
        total_likes: likeCount // Dùng cho sort
      };
    }));

    // 5. Sắp xếp & lấy top 10
    const leaderBoard = postsWithLikes
      .sort((a, b) => b.total_likes - a.total_likes)
      .slice(0, 10)
      .map((post, index) => ({
        rank: index + 1,
        ...post
      }));

    res.status(200).json({
      message: `Leaderboard retrieved successfully for challenge ID ${challenge_id}`,
      leaderboard: leaderBoard,
      total_posts: postsWithLikes.length,
      challenge_id
    });

  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({
      message: 'Error fetching leaderboard',
      error: err.message
    });
  }
};