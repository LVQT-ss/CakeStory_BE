import express from 'express';
import {
  createChallengePost,
  getAllChallengePosts,
  getChallengePostById,
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
 *     description: Create a new post for a specific challenge
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
 *         description: Missing required fields
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
 *     summary: Get all challenge posts
 *     description: Retrieve all challenge posts and their associated media
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
 *     description: Retrieve a specific challenge post by its post ID
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
 * /api/challenge-posts/{post_id}:
 *   put:
 *     tags: [ChallengePost]
 *     summary: Update a challenge post
 *     description: Update the title, description, visibility, or design flag of a challenge post
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
 *     responses:
 *       200:
 *         description: Challenge post updated successfully
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
 *     summary: Delete a challenge post
 *     description: Delete a challenge post by its post ID
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
 *       404:
 *         description: Challenge post not found
 *       500:
 *         description: Server error
 */
router.delete('/:post_id', verifyToken, deleteChallengePost);

export default router;
