import express from 'express';
import {
  createChallengeEntry,
  getAllChallengeEntries,
  getChallengeEntryById,
  getChallengeEntriesByChallengeId,
  updateChallengeEntry,
  deleteChallengeEntry,
} from '../controllers/challengeEntry.controller.js';
import { verifyAdmin, verifyStaff, verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Challenge Entries
 *   description: Endpoints for managing challenge entries
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ChallengeEntry:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         challenge_id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             username:
 *               type: string
 *             email:
 *               type: string
 *             full_name:
 *               type: string
 *             avatar:
 *               type: string
 */

/**
 * @swagger
 * /api/challenge-entries:
 *   post:
 *     tags: [Challenge Entries]
 *     summary: Create a new challenge entry
 *     description: Join a challenge by creating a challenge entry
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - challenge_id
 *               - user_id
 *             properties:
 *               challenge_id:
 *                 type: integer
 *                 example: 1
 *               user_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Challenge entry created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Challenge entry created
 *                 entry:
 *                   $ref: '#/components/schemas/ChallengeEntry'
 *       400:
 *         description: User already joined or challenge full
 *       404:
 *         description: Challenge not found
 *       500:
 *         description: Error creating entry
 */
router.post('/', verifyToken, createChallengeEntry);

/**
 * @swagger
 * /api/challenge-entries:
 *   get:
 *     tags: [Challenge Entries]
 *     summary: Get all challenge entries
 *     description: Retrieve all challenge entries with user info
 *     responses:
 *       200:
 *         description: Entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 entries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChallengeEntry'
 *       500:
 *         description: Server error
 */
router.get('/', verifyAdmin, verifyStaff, getAllChallengeEntries);

/**
 * @swagger
 * /api/challenge-entries/{id}:
 *   get:
 *     tags: [Challenge Entries]
 *     summary: Get a challenge entry by ID
 *     description: Retrieve a single challenge entry using its ID with user info
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Entry ID
 *     responses:
 *       200:
 *         description: Entry retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 entry:
 *                   $ref: '#/components/schemas/ChallengeEntry'
 *       404:
 *         description: Entry not found
 *       500:
 *         description: Server error
 */
router.get('/:id', verifyToken,getChallengeEntryById);

/**
 * @swagger
 * /api/challenge-entries/challenge/{challenge_id}:
 *   get:
 *     tags: [Challenge Entries]
 *     summary: Get all challenge entries by challenge ID
 *     description: Retrieve all entries for a specific challenge with user info
 *     parameters:
 *       - in: path
 *         name: challenge_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Challenge ID
 *     responses:
 *       200:
 *         description: Entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 entries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChallengeEntry'
 *       500:
 *         description: Server error
 */
router.get('/challenge/:challenge_id', verifyToken, getChallengeEntriesByChallengeId);

/**
 * @swagger
 * /api/challenge-entries/{id}:
 *   put:
 *     tags: [Challenge Entries]
 *     summary: Update a challenge entry
 *     description: Modify challenge_id or user_id of a challenge entry
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               challenge_id:
 *                 type: integer
 *                 example: 2
 *               user_id:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Entry updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 entry:
 *                   $ref: '#/components/schemas/ChallengeEntry'
 *       404:
 *         description: Entry not found
 *       500:
 *         description: Error updating entry
 */
router.put('/:id', updateChallengeEntry);

/**
 * @swagger
 * /api/challenge-entries/{id}:
 *   delete:
 *     tags: [Challenge Entries]
 *     summary: Delete a challenge entry
 *     description: Remove a user's entry from a challenge
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Entry ID
 *     responses:
 *       200:
 *         description: Entry deleted
 *       404:
 *         description: Entry not found
 *       500:
 *         description: Error deleting entry
 */
router.delete('/:id', verifyToken, verifyStaff, deleteChallengeEntry);

export default router;
