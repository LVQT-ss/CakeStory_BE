import express from 'express';
import {
  createChallenge,
  getAllChallenges,
  getChallengeById,
  updateChallenge,
  deleteChallenge
} from '../controllers/challenge.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Challenge
 *   description: APIs for managing cake challenges
 */

/**
 * @swagger
 * /api/challenges:
 *   post:
 *     tags: [Challenge]
 *     summary: Create a new challenge
 *     description: Create a new cake challenge with future start and end dates
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
 *               - start_date
 *               - end_date
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               prize_description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Challenge created successfully
 *       400:
 *         description: Validation error (e.g., start date too soon)
 *       500:
 *         description: Server error
 */
router.post('/', verifyToken, createChallenge);

/**
 * @swagger
 * /api/challenges:
 *   get:
 *     tags: [Challenge]
 *     summary: Get all challenges
 *     description: Retrieve all challenges with status other than "unAvailable"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Challenges retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', verifyToken, getAllChallenges);

/**
 * @swagger
 * /api/challenges/{id}:
 *   get:
 *     tags: [Challenge]
 *     summary: Get a challenge by ID
 *     description: Retrieve a single challenge by its ID (must not be unAvailable)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Challenge ID
 *     responses:
 *       200:
 *         description: Challenge retrieved successfully
 *       404:
 *         description: Challenge not found
 *       500:
 *         description: Server error
 */
router.get('/:id', verifyToken, getChallengeById);

/**
 * @swagger
 * /api/challenges/{id}:
 *   put:
 *     tags: [Challenge]
 *     summary: Update a challenge
 *     description: Update challenge details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Challenge ID
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
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               prize_description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [notStart, onGoing, ended]
 *     responses:
 *       200:
 *         description: Challenge updated successfully
 *       404:
 *         description: Challenge not found
 *       500:
 *         description: Server error
 */
router.put('/:id', verifyToken, updateChallenge);

/**
 * @swagger
 * /api/challenges/{id}:
 *   delete:
 *     tags: [Challenge]
 *     summary: Delete (soft) a challenge
 *     description: Set a challenge's status to "unAvailable" instead of hard-deleting it
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Challenge ID
 *     responses:
 *       200:
 *         description: Challenge soft-deleted successfully
 *       404:
 *         description: Challenge not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', verifyToken, deleteChallenge);

export default router;
