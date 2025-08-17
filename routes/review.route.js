import express from 'express';
import { createReview, getReviewById, getReviewsByOrderId, getReviewsByMarketplaceId, updateReview, deleteReview } from '../controllers/review.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     tags:
 *       - Reviews
 *     summary: Create a review for a completed cake order
 *     description: Create a review for a cake order. Only allows reviews for completed orders and prevents duplicate reviews.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *               - rating
 *             properties:
 *               order_id:
 *                 type: integer
 *                 example: 1
 *                 description: ID of the cake order to review
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *                 description: Rating from 1 to 5 stars
 *               comment:
 *                 type: string
 *                 example: "Amazing cake! The design was perfect and it tasted delicious."
 *                 description: Optional review comment
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review created successfully"
 *                 review:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     order_id:
 *                       type: integer
 *                       example: 1
 *                     rating:
 *                       type: integer
 *                       example: 5
 *                     comment:
 *                       type: string
 *                       example: "Amazing cake! The design was perfect and it tasted delicious."
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-20T10:00:00Z"
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         username:
 *                           type: string
 *                           example: "johndoe"
 *                         full_name:
 *                           type: string
 *                           example: "John Doe"
 *                         avatar:
 *                           type: string
 *                           example: "https://example.com/avatar.jpg"
 *                     CakeOrder:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         total_price:
 *                           type: number
 *                           example: 45.99
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-03-15T08:00:00Z"
 *       400:
 *         description: Bad Request - Invalid input or order not completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You can only review completed orders"
 *                 currentOrderStatus:
 *                   type: string
 *                   example: "pending"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied. No token provided."
 *       404:
 *         description: Order not found or not authorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order not found or you are not authorized to review this order"
 *       409:
 *         description: Conflict - Review already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You have already reviewed this order"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating review"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.post('/', verifyToken, createReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     tags:
 *       - Reviews
 *     summary: Get a specific review by ID
 *     description: Retrieve a specific review by its ID. Users can only access their own reviews.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the review to retrieve
 *         example: 1
 *     responses:
 *       200:
 *         description: Review retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review retrieved successfully"
 *                 review:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     order_id:
 *                       type: integer
 *                       example: 1
 *                     rating:
 *                       type: integer
 *                       example: 5
 *                     comment:
 *                       type: string
 *                       example: "Amazing cake! The design was perfect and it tasted delicious."
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-20T10:00:00Z"
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         username:
 *                           type: string
 *                           example: "johndoe"
 *                         full_name:
 *                           type: string
 *                           example: "John Doe"
 *                         avatar:
 *                           type: string
 *                           example: "https://example.com/avatar.jpg"
 *                     CakeOrder:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         total_price:
 *                           type: number
 *                           example: 45.99
 *                         status:
 *                           type: string
 *                           example: "completed"
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-03-15T08:00:00Z"
 *                         shipped_at:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-03-18T14:30:00Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied. No token provided."
 *       404:
 *         description: Review not found or not authorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review not found or you are not authorized to access this review"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving review"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.get('/:id', verifyToken, getReviewById);

/**
 * @swagger
 * /api/reviews/order/{orderId}:
 *   get:
 *     tags:
 *       - Reviews
 *     summary: Get all reviews for a specific cake order
 *     description: Retrieve all reviews for a specific cake order. Only accessible by the customer who placed the order or the shop owner.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the cake order
 *         example: 1
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reviews retrieved successfully"
 *                 orderId:
 *                   type: integer
 *                   example: 1
 *                 totalReviews:
 *                   type: integer
 *                   example: 2
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       user_id:
 *                         type: integer
 *                         example: 1
 *                       order_id:
 *                         type: integer
 *                         example: 1
 *                       rating:
 *                         type: integer
 *                         example: 5
 *                       comment:
 *                         type: string
 *                         example: "Amazing cake! The design was perfect and it tasted delicious."
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-20T10:00:00Z"
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           username:
 *                             type: string
 *                             example: "johndoe"
 *                           full_name:
 *                             type: string
 *                             example: "John Doe"
 *                           avatar:
 *                             type: string
 *                             example: "https://example.com/avatar.jpg"
 *                       CakeOrder:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           total_price:
 *                             type: number
 *                             example: 45.99
 *                           status:
 *                             type: string
 *                             example: "completed"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-03-15T08:00:00Z"
 *                           shipped_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-03-18T14:30:00Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied. No token provided."
 *       404:
 *         description: Order not found or not authorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order not found or you are not authorized to view reviews for this order"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving reviews"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.get('/order/:orderId', verifyToken, getReviewsByOrderId);

/**
 * @swagger
 * /api/reviews/marketplace/{marketplaceId}:
 *   get:
 *     tags:
 *       - Reviews
 *     summary: Get all reviews for a specific marketplace post
 *     description: Retrieve all reviews for a specific marketplace post. Only accessible by the shop owner or customers who ordered from this marketplace post.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: marketplaceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the marketplace post
 *         example: 1
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reviews retrieved successfully"
 *                 marketplaceId:
 *                   type: integer
 *                   example: 1
 *                 totalOrders:
 *                   type: integer
 *                   example: 5
 *                 totalReviews:
 *                   type: integer
 *                   example: 3
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       user_id:
 *                         type: integer
 *                         example: 1
 *                       order_id:
 *                         type: integer
 *                         example: 1
 *                       rating:
 *                         type: integer
 *                         example: 5
 *                       comment:
 *                         type: string
 *                         example: "Amazing cake! The design was perfect and it tasted delicious."
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-20T10:00:00Z"
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           username:
 *                             type: string
 *                             example: "johndoe"
 *                           full_name:
 *                             type: string
 *                             example: "John Doe"
 *                           avatar:
 *                             type: string
 *                             example: "https://example.com/avatar.jpg"
 *                       CakeOrder:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           total_price:
 *                             type: number
 *                             example: 45.99
 *                           status:
 *                             type: string
 *                             example: "completed"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-03-15T08:00:00Z"
 *                           shipped_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-03-18T14:30:00Z"
 *                           marketplace_post_id:
 *                             type: integer
 *                             example: 1
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied. No token provided."
 *       404:
 *         description: Marketplace post not found or not authorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Marketplace post not found or you are not authorized to view reviews for this marketplace post"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving reviews"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.get('/marketplace/:marketplaceId', verifyToken, getReviewsByMarketplaceId);

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     tags:
 *       - Reviews
 *     summary: Update a review
 *     description: Update an existing review. Users can only update their own reviews.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the review to update
 *         example: 1
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *                 description: Updated rating from 1 to 5 stars
 *               comment:
 *                 type: string
 *                 example: "Updated review: Good cake but could be better!"
 *                 description: Updated review comment
 *     responses:
 *       200:
 *         description: Review updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review updated successfully"
 *                 review:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     order_id:
 *                       type: integer
 *                       example: 1
 *                     rating:
 *                       type: integer
 *                       example: 4
 *                     comment:
 *                       type: string
 *                       example: "Updated review: Good cake but could be better!"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-20T10:00:00Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-21T15:30:00Z"
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         username:
 *                           type: string
 *                           example: "johndoe"
 *                         full_name:
 *                           type: string
 *                           example: "John Doe"
 *                         avatar:
 *                           type: string
 *                           example: "https://example.com/avatar.jpg"
 *                     CakeOrder:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         total_price:
 *                           type: number
 *                           example: 45.99
 *                         status:
 *                           type: string
 *                           example: "completed"
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-03-15T08:00:00Z"
 *                         shipped_at:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-03-18T14:30:00Z"
 *       400:
 *         description: Bad Request - Invalid input or no fields to update
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rating must be between 1 and 5"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied. No token provided."
 *       404:
 *         description: Review not found or not authorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review not found or you are not authorized to update this review"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error updating review"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.put('/:id', verifyToken, updateReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     tags:
 *       - Reviews
 *     summary: Delete a review
 *     description: Delete an existing review. Users can only delete their own reviews.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the review to delete
 *         example: 1
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review deleted successfully"
 *                 deletedReview:
 *                   type: object
 *                   description: "Information about the deleted review for confirmation"
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     order_id:
 *                       type: integer
 *                       example: 1
 *                     rating:
 *                       type: integer
 *                       example: 5
 *                     comment:
 *                       type: string
 *                       example: "Amazing cake! The design was perfect and it tasted delicious."
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         username:
 *                           type: string
 *                           example: "johndoe"
 *                         full_name:
 *                           type: string
 *                           example: "John Doe"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied. No token provided."
 *       404:
 *         description: Review not found or not authorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review not found or you are not authorized to delete this review"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error deleting review"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.delete('/:id', verifyToken, deleteReview);

export default router;
