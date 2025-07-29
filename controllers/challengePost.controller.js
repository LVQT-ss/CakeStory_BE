import sequelize from '../database/db.js';
import ChallengePost from '../models/challenge_post.model.js';
import Post from '../models/post.model.js';
import PostData from '../models/post_data.model.js';
import Challenge from '../models/challenge.model.js';

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

    const challenge = await Challenge.findByPk(challenge_id);
    if (!challenge) throw new Error('Challenge not found');

    const post = await Post.create({
      title,
      description: description || null,
      post_type: 'challenge',
      is_public,
      created_at: new Date()
    }, { transaction });

    await ChallengePost.create({
      post_id: post.id,
      challenge_id,
      challengeName: challenge.title,
      is_challenge: true,
      is_design,
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
      include: [
        {
          model: Post,
          as: 'post',
          include: [{ model: PostData, as: 'media' }]
        }
      ]
    });

    res.status(200).json({ message: 'Challenge posts retrieved', posts });
  } catch (err) {
    console.error('Error fetching challenge posts:', err);
    res.status(500).json({ message: 'Error fetching challenge posts', error: err.message });
  }
};

// Get challenge post by post_id
export const getChallengePostById = async (req, res) => {
  try {
    const { post_id } = req.params;
    const post = await ChallengePost.findByPk(post_id, {
      include: [
        {
          model: Post,
          as: 'post',
          include: [{ model: PostData, as: 'media' }]
        }
      ]
    });

    if (!post) return res.status(404).json({ message: 'Challenge post not found' });

    res.status(200).json({ message: 'Challenge post retrieved', post });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving challenge post', error: err.message });
  }
};

// Update challenge post
export const updateChallengePost = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { post_id } = req.params;
    const {
      title, description, is_public,
      is_design
    } = req.body;

    const challengePost = await ChallengePost.findByPk(post_id, {
      include: [{ model: Post, as: 'post' }],
      transaction
    });

    if (!challengePost) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Challenge post not found' });
    }

    await challengePost.update({ is_design }, { transaction });

    if (challengePost.post) {
      await challengePost.post.update({
        title, description, is_public
      }, { transaction });
    }

    await transaction.commit();

    return res.status(200).json({ message: 'Challenge post updated', post: challengePost });
  } catch (err) {
    if (!transaction.finished) await transaction.rollback();
    res.status(500).json({ message: 'Error updating challenge post', error: err.message });
  }
};

// Delete challenge post
export const deleteChallengePost = async (req, res) => {
  try {
    const { post_id } = req.params;

    const post = await ChallengePost.findByPk(post_id);
    if (!post) return res.status(404).json({ message: 'Challenge post not found' });

    await post.destroy();
    res.status(200).json({ message: 'Challenge post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting challenge post', error: err.message });
  }
};
