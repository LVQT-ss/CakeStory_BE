import CakeQuote from '../models/cake_quote.model.js';
import CakeOrder from '../models/cake_order.model.js';
import CakeDesign from '../models/cake_design.model.js';
import User from '../models/User.model.js';
import { Op } from 'sequelize';
import sequelize from '../database/db.js';

// Create a new cake quote (requires user to have completed at least one order)
export const createCakeQuote = async (req, res) => {
    try {
        const {
            title,
            description,
            imageDesign,
            cake_size,
            special_requirements,
            budget_range,
            expires_at
        } = req.body;
        const user_id = req.userId; // From JWT token

        // Validate required fields
        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        // Use transaction to ensure data consistency
        const result = await sequelize.transaction(async (t) => {
            // 1. Check if user exists
            const user = await User.findByPk(user_id, { transaction: t });
            if (!user) {
                throw new Error('User not found');
            }

            // 2. Check if user has completed at least one cake order
            const completedOrders = await CakeOrder.findAll({
                where: {
                    customer_id: user_id,
                    status: 'completed'
                },
                limit: 1,
                transaction: t
            });

            if (completedOrders.length === 0) {
                throw new Error('You must complete at least one cake order before creating a quote request. Please purchase a cake first to unlock this feature.');
            }

            // 3. Validate cake design if provided
            if (imageDesign) {
                // Check if it's a cake design ID (numeric) or a URL/Base64 image
                if (!isNaN(imageDesign)) {
                    // It's a cake design ID, check if it exists and user has access
                    const cakeDesign = await CakeDesign.findByPk(imageDesign, { transaction: t });
                    if (!cakeDesign) {
                        throw new Error('Cake design not found');
                    }

                    // Check if user owns the design or it's public
                    if (!cakeDesign.is_public && cakeDesign.user_id !== user_id) {
                        throw new Error('You can only use your own designs or public designs');
                    }

                    // Use the design image URL instead of the ID
                    req.body.imageDesign = cakeDesign.design_image;
                }
                // If it's a URL or Base64, keep it as is
            }

            // 4. Validate expires_at if provided
            if (expires_at) {
                const expirationDate = new Date(expires_at);
                const now = new Date();
                if (expirationDate <= now) {
                    throw new Error('Expiration date must be in the future');
                }
            }

            // 5. Create the cake quote
            const cakeQuote = await CakeQuote.create({
                user_id,
                title,
                description,
                imageDesign: req.body.imageDesign,
                cake_size,
                special_requirements,
                budget_range,
                expires_at: expires_at ? new Date(expires_at) : null,
                status: 'open'
            }, { transaction: t });

            return cakeQuote;
        });

        // Fetch the created quote with user information
        const createdQuote = await CakeQuote.findByPk(result.id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'full_name', 'avatar']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Cake quote created successfully',
            data: createdQuote
        });

    } catch (error) {
        console.error('Error creating cake quote:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create cake quote'
        });
    }
};


