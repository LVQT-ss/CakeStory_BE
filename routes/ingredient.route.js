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
 *     summary: Get all ingredients
 *     description: Retrieve all ingredients (optionally filtered by shop_id)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: shop_id
 *         schema:
 *           type: integer
 *         description: ID of the shop to filter ingredients
 *     responses:
 *       200:
 *         description: List of ingredients retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', verifyToken, getAllIngredients);

/**
 * @swagger
 * /api/ingredients/{id}:
 *   get:
 *     tags: [Ingredient]
 *     summary: Get an ingredient by ID
 *     description: Retrieve details of a specific ingredient
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the ingredient
 *     responses:
 *       200:
 *         description: Ingredient retrieved successfully
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
 *     summary: Update an ingredient
 *     description: Update the details of a specific ingredient in the current user's shop
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
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Ingredient updated successfully
 *       403:
 *         description: Not authorized to update this ingredient
 *       404:
 *         description: Ingredient not found
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
 *     description: Mark an ingredient as deleted (soft delete) from the current user's shop
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
 *         description: Ingredient deleted successfully
 *       403:
 *         description: Not authorized to delete this ingredient
 *       404:
 *         description: Ingredient not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', verifyToken, deleteIngredient);

export default router;
