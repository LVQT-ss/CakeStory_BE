import express from 'express';
import {
  createChallengePost,
  getAllChallengePosts,
  getChallengePostById,
  getChallengePostsByUserId,
  getChallengePostsByChallengeId,
  updateChallengePost,
  deleteChallengePost
} from '../controllers/challengePost.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ChallengePost
 *   description: APIs for managing challenge posts
 */

/**
 * @swagger
 * /api/challenge-posts:
 *   post:
 *     tags: [ChallengePost]
 *     summary: Create a new challenge post
 *     description: Create a new post for a specific challenge (one per user)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - challenge_id
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               challenge_id:
 *                 type: integer
 *               is_design:
 *                 type: boolean
 *               is_public:
 *                 type: boolean
 *               media:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     image_url:
 *                       type: string
 *                     video_url:
 *                       type: string
 *     responses:
 *       201:
 *         description: Challenge post created successfully
 *       400:
 *         description: Missing required fields or user already has active challenge post
 *       404:
 *         description: Challenge not found
 *       500:
 *         description: Server error
 */
router.post('/', verifyToken, createChallengePost);

/**
 * @swagger
 * /api/challenge-posts:
 *   get:
 *     tags: [ChallengePost]
 *     summary: Get all active challenge posts
 *     description: Retrieve all active challenge posts and their associated media
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Challenge posts retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', verifyToken, getAllChallengePosts);

/**
 * @swagger
 * /api/challenge-posts/{post_id}:
 *   get:
 *     tags: [ChallengePost]
 *     summary: Get a challenge post by ID
 *     description: Retrieve a specific active challenge post by its post ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID of the challenge post
 *     responses:
 *       200:
 *         description: Challenge post retrieved successfully
 *       404:
 *         description: Challenge post not found
 *       500:
 *         description: Server error
 */
router.get('/:post_id', verifyToken, getChallengePostById);

/**
 * @swagger
 * /api/challenge-posts/user/{userId}:
 *   get:
 *     tags: [ChallengePost]
 *     summary: Get challenge posts by user ID
 *     description: Retrieve all active challenge posts for a specific user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User challenge posts retrieved successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', verifyToken, getChallengePostsByUserId);

/**
 * @swagger
 * /api/challenge-posts/challenge/{challenge_id}:
 *   get:
 *     tags: [ChallengePost]
 *     summary: Get challenge posts by challenge ID
 *     description: Retrieve all active challenge posts for a specific challenge
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: challenge_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Challenge ID
 *     responses:
 *       200:
 *         description: Challenge posts retrieved successfully by challenge_id
 *       404:
 *         description: Challenge not found
 *       500:
 *         description: Server error
 */
router.get('/challenge/:challenge_id', verifyToken, getChallengePostsByChallengeId);

/**
 * @swagger
 * /api/challenge-posts/{post_id}:
 *   put:
 *     tags: [ChallengePost]
 *     summary: Update a challenge post
 *     description: Update the title, description, visibility, design flag, or media of a challenge post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID of the challenge post
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               is_public:
 *                 type: boolean
 *               is_design:
 *                 type: boolean
 *               media:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     image_url:
 *                       type: string
 *                     video_url:
 *                       type: string
 *     responses:
 *       200:
 *         description: Challenge post updated successfully
 *       403:
 *         description: Unauthorized to update this post
 *       404:
 *         description: Challenge post not found
 *       500:
 *         description: Server error
 */
router.put('/:post_id', verifyToken, updateChallengePost);

/**
 * @swagger
 * /api/challenge-posts/{post_id}:
 *   delete:
 *     tags: [ChallengePost]
 *     summary: Soft delete a challenge post
 *     description: Soft delete a challenge post by setting is_active to false
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID of the challenge post
 *     responses:
 *       200:
 *         description: Challenge post deleted successfully
 *       403:
 *         description: Unauthorized to delete this post
 *       404:
 *         description: Challenge post not found
 *       500:
 *         description: Server error
 */
router.delete('/:post_id', verifyToken, deleteChallengePost);

export default router;
