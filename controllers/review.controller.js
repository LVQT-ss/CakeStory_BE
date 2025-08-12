import Review from '../models/review.model.js';
import CakeOrder from '../models/cake_order.model.js';
import User from '../models/User.model.js';
import sequelize from '../database/db.js';

export const createReview = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { order_id, rating, comment } = req.body;
        const user_id = req.userId; // From verified token

        // Validate required fields
        if (!order_id || !rating) {
            await transaction.rollback();
            return res.status(400).json({
                message: 'Order ID and rating are required'
            });
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            await transaction.rollback();
            return res.status(400).json({
                message: 'Rating must be between 1 and 5'
            });
        }

        // Check if the order exists and belongs to the user
        const cakeOrder = await CakeOrder.findOne({
            where: {
                id: order_id,
                customer_id: user_id
            }
        });

        if (!cakeOrder) {
            await transaction.rollback();
            return res.status(404).json({
                message: 'Order not found or you are not authorized to review this order'
            });
        }

        // Check if order status is completed
        if (cakeOrder.status !== 'completed') {
            await transaction.rollback();
            return res.status(400).json({
                message: 'You can only review completed orders',
                currentOrderStatus: cakeOrder.status
            });
        }

        // Check if user has already reviewed this order
        const existingReview = await Review.findOne({
            where: {
                order_id: order_id,
                user_id: user_id
            }
        });

        if (existingReview) {
            await transaction.rollback();
            return res.status(409).json({
                message: 'You have already reviewed this order'
            });
        }

        // Create the review
        const review = await Review.create({
            user_id,
            order_id,
            rating,
            comment: comment || null,
            created_at: new Date()
        }, { transaction });

        // Commit transaction
        await transaction.commit();

        // Fetch the created review with related data
        const createdReview = await Review.findByPk(review.id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'full_name', 'avatar']
                },
                {
                    model: CakeOrder,
                    attributes: ['id', 'total_price', 'created_at']
                }
            ]
        });

        res.status(201).json({
            message: 'Review created successfully',
            review: createdReview
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error creating review:', error);

        // Handle unique constraint violation
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                message: 'You have already reviewed this order'
            });
        }

        res.status(500).json({
            message: 'Error creating review',
            error: error.message
        });
    }
};
