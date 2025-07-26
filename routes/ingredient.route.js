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
 * tags:
 *   name: Ingredient
 *   description: APIs for managing ingredients belonging to shops
 */

/**
 * @swagger
 * /api/ingredients:
 *   post:
 *     tags: [Ingredient]
 *     summary: Create a new ingredient
 *     description: Add a new ingredient to the current user's shop (auto detects user's shop)
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
 *     summary: Get all ingredients of a specific shop
 *     description: Retrieve all non-deleted ingredients by shop_id
 *     parameters:
 *       - in: query
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the shop to filter ingredients
 *     responses:
 *       200:
 *         description: List of ingredients retrieved successfully
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
 *         description: Missing shop_id in query
 *       500:
 *         description: Server error
 */
router.get('/', verifyToken, getAllIngredients);

/**
 * @swagger
 * /api/ingredients/{id}:
 *   get:
 *     tags: [Ingredient]
 *     summary: Get a specific ingredient by ID
 *     description: Retrieve details of a specific ingredient by ID and shop_id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the ingredient
 *       - in: query
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shop ID to ensure the ingredient belongs to that shop
 *     responses:
 *       200:
 *         description: Ingredient retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingredient'
 *       400:
 *         description: Missing shop_id
 *       404:
 *         description: Ingredient not found
 *       500:
 *         description: Server error
 */
router.get('/:id', verifyToken, getIngredientById);

/**
 * @swagger
 * /api/ingredients/{id}:
 *   put:
 *     tags: [Ingredient]
 *     summary: Update an existing ingredient
 *     description: Update the name or price of an existing ingredient
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the ingredient to update
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Unsalted Butter"
 *               price:
 *                 type: number
 *                 example: 4.0
 *     responses:
 *       200:
 *         description: Ingredient updated successfully
 *       404:
 *         description: Ingredient not found or deleted
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
 *     description: Soft delete an ingredient by setting its `is_deleted` flag
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the ingredient to delete
 *     responses:
 *       200:
 *         description: Ingredient soft deleted successfully
 *       404:
 *         description: Ingredient not found or already deleted
 *       500:
 *         description: Server error
 */
router.delete('/:id', verifyToken, deleteIngredient);

export default router;
