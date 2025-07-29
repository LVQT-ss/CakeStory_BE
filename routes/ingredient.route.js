import express from 'express';
import {
  createIngredient,
  getAllIngredients,
  getIngredientById,
  updateIngredient,
  deleteIngredient
} from '../controllers/ingredient.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/ingredients:
 *   post:
 *     tags: [Ingredient]
 *     summary: Create a new ingredient
 *     description: Add a new ingredient to the current user's shop
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Butter"
 *               price:
 *                 type: number
 *                 example: 3.5
 *               image:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *               description:
 *                 type: string
 *                 example: "High-quality unsalted butter"
 *     responses:
 *       201:
 *         description: Ingredient created successfully
 *       403:
 *         description: Shop not found for current user
 *       500:
 *         description: Server error
 */
router.post('/', verifyToken, createIngredient);

/**
 * @swagger
 * /api/ingredients:
 *   get:
 *     tags: [Ingredient]
 *     summary: Get all ingredients of a shop
 *     parameters:
 *       - in: query
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the shop
 *     responses:
 *       200:
 *         description: Ingredients fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ingredients:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ingredient'
 *       400:
 *         description: Missing shop_id
 *       500:
 *         description: Server error
 */
router.get('/', verifyToken, getAllIngredients);

/**
 * @swagger
 * /api/ingredients/{id}:
 *   get:
 *     tags: [Ingredient]
 *     summary: Get ingredient by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ingredient ID
 *       - in: query
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shop ID
 *     responses:
 *       200:
 *         description: Ingredient fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingredient'
 *       400:
 *         description: Missing shop_id
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.get('/:id', verifyToken, getIngredientById);

/**
 * @swagger
 * /api/ingredients/{id}:
 *   put:
 *     tags: [Ingredient]
 *     summary: Update an ingredient
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ingredient ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ingredient updated
 *       404:
 *         description: Not found or deleted
 *       500:
 *         description: Server error
 */
router.put('/:id', verifyToken, updateIngredient);

/**
 * @swagger
 * /api/ingredients/{id}:
 *   delete:
 *     tags: [Ingredient]
 *     summary: Soft delete an ingredient
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ingredient ID
 *     responses:
 *       200:
 *         description: Ingredient soft deleted
 *       404:
 *         description: Not found or already deleted
 *       500:
 *         description: Server error
 */
router.delete('/:id', verifyToken, deleteIngredient);

export default router;
