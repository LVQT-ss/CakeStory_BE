import CakeQuote from '../models/cake_quote.model.js';
import ShopQuote from '../models/shop_quote.model.js';
import CakeOrder from '../models/cake_order.model.js';
import CakeDesign from '../models/cake_design.model.js';
import Shop from '../models/shop.model.js';
import User from '../models/User.model.js';
// import { Op } from 'sequelize'; // Unused for now
import sequelize from '../database/db.js';
import Transaction from '../models/transaction.model.js';
import Wallet from '../models/wallet.model.js';

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

// Get all cake quotes
export const getCakeQuotes = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: cakeQuotes } = await CakeQuote.findAndCountAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'full_name', 'avatar']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            success: true,
            message: 'Cake quotes retrieved successfully',
            data: {
                quotes: cakeQuotes,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    totalItems: count,
                    itemsPerPage: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Error retrieving cake quotes:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve cake quotes'
        });
    }
};

// Get a specific cake quote by ID
export const getCakeQuoteById = async (req, res) => {
    try {
        const { id } = req.params;

        const cakeQuote = await CakeQuote.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'full_name', 'avatar']
                }
            ]
        });

        if (!cakeQuote) {
            return res.status(404).json({
                success: false,
                message: 'Cake quote not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cake quote retrieved successfully',
            data: cakeQuote
        });

    } catch (error) {
        console.error('Error retrieving cake quote:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve cake quote'
        });
    }
};

// Update cake quote status (only owner can update)
export const updateCakeQuoteStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const user_id = req.userId;

        if (!status || !['open', 'closed', 'expired'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid status is required (open, closed, expired)'
            });
        }

        const cakeQuote = await CakeQuote.findByPk(id);

        if (!cakeQuote) {
            return res.status(404).json({
                success: false,
                message: 'Cake quote not found'
            });
        }

        // Check if user owns the quote
        if (cakeQuote.user_id !== user_id) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own quotes'
            });
        }

        await cakeQuote.update({ status });

        res.status(200).json({
            success: true,
            message: 'Cake quote status updated successfully',
            data: cakeQuote
        });

    } catch (error) {
        console.error('Error updating cake quote status:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update cake quote status'
        });
    }
};

// Delete cake quote (only owner can delete)
export const deleteCakeQuote = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.userId;

        const cakeQuote = await CakeQuote.findByPk(id);

        if (!cakeQuote) {
            return res.status(404).json({
                success: false,
                message: 'Cake quote not found'
            });
        }

        // Check if user owns the quote
        if (cakeQuote.user_id !== user_id) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own quotes'
            });
        }

        await cakeQuote.destroy();

        res.status(200).json({
            success: true,
            message: 'Cake quote deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting cake quote:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete cake quote'
        });
    }
};

// ============ SHOP QUOTE FUNCTIONS ============

// Create a shop quote for a cake quote
export const createShopQuote = async (req, res) => {
    try {
        const {
            cake_quote_id,
            quoted_price,
            preparation_time,
            message,
            ingredients_breakdown
        } = req.body;
        const user_id = req.userId; // From JWT token

        // Validate required fields
        if (!cake_quote_id || !quoted_price) {
            return res.status(400).json({
                success: false,
                message: 'Cake quote ID and quoted price are required'
            });
        }

        // Use transaction to ensure data consistency
        const result = await sequelize.transaction(async (t) => {
            // 1. Check if user exists
            const user = await User.findByPk(user_id, { transaction: t });
            if (!user) {
                throw new Error('User not found');
            }

            // 2. Check if user owns a shop
            const shop = await Shop.findOne({
                where: { user_id: user_id },
                transaction: t
            });

            if (!shop) {
                throw new Error('You must have a shop to create quotes. Please create a shop first.');
            }

            // 3. Check if cake quote exists and is still open
            const cakeQuote = await CakeQuote.findByPk(cake_quote_id, { transaction: t });
            if (!cakeQuote) {
                throw new Error('Cake quote not found');
            }

            if (cakeQuote.status !== 'open') {
                throw new Error('This cake quote is no longer accepting quotes');
            }

            // 4. Check if quote has expired
            if (cakeQuote.expires_at && new Date(cakeQuote.expires_at) <= new Date()) {
                throw new Error('This cake quote has expired');
            }

            // 5. Check if shop has already quoted for this cake quote
            const existingQuote = await ShopQuote.findOne({
                where: {
                    cake_quote_id: cake_quote_id,
                    shop_id: shop.shop_id
                },
                transaction: t
            });

            if (existingQuote) {
                throw new Error('You have already submitted a quote for this cake request');
            }

            // 6. Validate quoted price
            if (quoted_price <= 0) {
                throw new Error('Quoted price must be greater than 0');
            }

            // 7. Validate preparation time if provided
            if (preparation_time && preparation_time <= 0) {
                throw new Error('Preparation time must be greater than 0 hours');
            }

            // 8. Create the shop quote
            const shopQuote = await ShopQuote.create({
                cake_quote_id,
                shop_id: shop.shop_id,
                quoted_price,
                preparation_time,
                message,
                ingredients_breakdown,
                status: 'pending'
            }, { transaction: t });

            return { shopQuote, shop };
        });

        // Fetch the created quote with shop and user information
        const createdQuote = await ShopQuote.findByPk(result.shopQuote.id, {
            include: [
                {
                    model: Shop,
                    as: 'shop',
                    attributes: ['shop_id', 'business_name', 'business_address', 'phone_number', 'avatar_image'],
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'username', 'full_name']
                        }
                    ]
                },
                {
                    model: CakeQuote,
                    as: 'cakeQuote',
                    attributes: ['id', 'title', 'description', 'cake_size', 'budget_range']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Shop quote created successfully',
            data: createdQuote
        });

    } catch (error) {
        console.error('Error creating shop quote:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create shop quote'
        });
    }
};

// Get all shop quotes for a specific cake quote
export const getShopQuotesByCakeQuote = async (req, res) => {
    try {
        const { cake_quote_id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        // Check if cake quote exists
        const cakeQuote = await CakeQuote.findByPk(cake_quote_id);
        if (!cakeQuote) {
            return res.status(404).json({
                success: false,
                message: 'Cake quote not found'
            });
        }

        const { count, rows: shopQuotes } = await ShopQuote.findAndCountAll({
            where: {
                cake_quote_id: cake_quote_id,
                is_active: true
            },
            include: [
                {
                    model: Shop,
                    as: 'shop',
                    attributes: ['shop_id', 'business_name', 'business_address', 'phone_number', 'avatar_image'],
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'username', 'full_name']
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            success: true,
            message: 'Shop quotes retrieved successfully',
            data: {
                cakeQuote: {
                    id: cakeQuote.id,
                    title: cakeQuote.title,
                    description: cakeQuote.description,
                    cake_size: cakeQuote.cake_size,
                    budget_range: cakeQuote.budget_range,
                    status: cakeQuote.status
                },
                quotes: shopQuotes,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    totalItems: count,
                    itemsPerPage: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Error retrieving shop quotes:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve shop quotes'
        });
    }
};

// Get shop quotes for a specific shop (shop owner can see their own quotes)
export const getShopQuotesByShop = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const user_id = req.userId;
        const offset = (page - 1) * limit;

        // Check if user owns a shop
        const shop = await Shop.findOne({
            where: { user_id: user_id }
        });

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found for this user'
            });
        }

        const { count, rows: shopQuotes } = await ShopQuote.findAndCountAll({
            where: {
                shop_id: shop.shop_id
            },
            include: [
                {
                    model: CakeQuote,
                    as: 'cakeQuote',
                    attributes: ['id', 'title', 'description', 'cake_size', 'budget_range', 'status', 'expires_at'],
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'username', 'full_name', 'avatar']
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            success: true,
            message: 'Shop quotes retrieved successfully',
            data: {
                shop: {
                    shop_id: shop.shop_id,
                    business_name: shop.business_name
                },
                quotes: shopQuotes,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    totalItems: count,
                    itemsPerPage: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Error retrieving shop quotes:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve shop quotes'
        });
    }
};

// Accept a shop quote (cake quote owner can accept)
export const acceptShopQuote = async (req, res) => {
    try {
        const { shop_quote_id } = req.params;
        const user_id = req.userId;

        const result = await sequelize.transaction(async (t) => {
            // 1. Find the shop quote
            const shopQuote = await ShopQuote.findByPk(shop_quote_id, {
                include: [
                    {
                        model: CakeQuote,
                        as: 'cakeQuote'
                    }
                ],
                transaction: t
            });

            if (!shopQuote) {
                throw new Error('Shop quote not found');
            }

            // 2. Check if user owns the cake quote
            if (shopQuote.cakeQuote.user_id !== user_id) {
                throw new Error('You can only accept quotes for your own cake requests');
            }

            // 3. Check if cake quote is still open
            if (shopQuote.cakeQuote.status !== 'open') {
                throw new Error('This cake quote is no longer accepting quotes');
            }

            // 4. Check if quote is still pending
            if (shopQuote.status !== 'pending') {
                throw new Error('This quote has already been processed');
            }

            // 5. Update shop quote status to accepted
            await shopQuote.update({
                status: 'accepted',
                accepted_at: new Date()
            }, { transaction: t });

            // 6. Update cake quote status to closed and set accepted shop
            await shopQuote.cakeQuote.update({
                status: 'closed',
                accepted_Shop: shopQuote.shop_id
            }, { transaction: t });

            return shopQuote;
        });

        // Fetch updated quote with all details
        const updatedQuote = await ShopQuote.findByPk(result.id, {
            include: [
                {
                    model: Shop,
                    as: 'shop',
                    attributes: ['shop_id', 'business_name', 'business_address', 'phone_number']
                },
                {
                    model: CakeQuote,
                    as: 'cakeQuote',
                    attributes: ['id', 'title', 'status', 'accepted_Shop']
                }
            ]
        });

        res.status(200).json({
            success: true,
            message: 'Shop quote accepted successfully',
            data: updatedQuote
        });

    } catch (error) {
        console.error('Error accepting shop quote:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to accept shop quote'
        });
    }
};

// Update shop quote (only shop owner can update their own quotes)
export const updateShopQuote = async (req, res) => {
    try {
        const { shop_quote_id } = req.params;
        const {
            quoted_price,
            preparation_time,
            message,
            ingredients_breakdown
        } = req.body;
        const user_id = req.userId;

        // Check if user owns a shop
        const shop = await Shop.findOne({
            where: { user_id: user_id }
        });

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found for this user'
            });
        }

        const shopQuote = await ShopQuote.findByPk(shop_quote_id, {
            include: [
                {
                    model: CakeQuote,
                    as: 'cakeQuote'
                }
            ]
        });

        if (!shopQuote) {
            return res.status(404).json({
                success: false,
                message: 'Shop quote not found'
            });
        }

        // Check if user owns this quote
        if (shopQuote.shop_id !== shop.shop_id) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own quotes'
            });
        }

        // Check if quote is still pending
        if (shopQuote.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'You can only update pending quotes'
            });
        }

        // Check if cake quote is still open
        if (shopQuote.cakeQuote.status !== 'open') {
            return res.status(400).json({
                success: false,
                message: 'The cake quote is no longer accepting updates'
            });
        }

        // Prepare update data
        const updateData = {};
        if (quoted_price !== undefined) {
            if (quoted_price <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Quoted price must be greater than 0'
                });
            }
            updateData.quoted_price = quoted_price;
        }
        if (preparation_time !== undefined) updateData.preparation_time = preparation_time;
        if (message !== undefined) updateData.message = message;
        if (ingredients_breakdown !== undefined) updateData.ingredients_breakdown = ingredients_breakdown;

        await shopQuote.update(updateData);

        res.status(200).json({
            success: true,
            message: 'Shop quote updated successfully',
            data: shopQuote
        });

    } catch (error) {
        console.error('Error updating shop quote:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update shop quote'
        });
    }
};

// CREATE CakeOrder from Accepted ShopQuote with Payment Processing
export const createOrderFromQuote = async (req, res) => {
    const { shop_quote_id, delivery_time } = req.body; // Required: shop_quote_id, optional: delivery_time
    const customer_id = req.userId; // From JWT
    const dbTransaction = await sequelize.transaction();

    try {
        // 1. Fetch shop_quote with cake_quote and shop
        const shopQuote = await ShopQuote.findByPk(shop_quote_id, {
            include: [
                { model: CakeQuote, as: 'cakeQuote' },
                { model: Shop, as: 'shop' }
            ],
            transaction: dbTransaction
        });

        if (!shopQuote || !shopQuote.cakeQuote || !shopQuote.shop) {
            await dbTransaction.rollback();
            return res.status(404).json({ message: 'Shop quote or related data not found' });
        }

        const cakeQuote = shopQuote.cakeQuote;

        // 2. Validate permissions and status
        if (shopQuote.status !== 'accepted') {
            await dbTransaction.rollback();
            return res.status(400).json({ message: 'Only accepted shop quotes can be converted to orders' });
        }

        if (cakeQuote.status !== 'closed' || cakeQuote.accepted_Shop !== shopQuote.shop_id) {
            await dbTransaction.rollback();
            return res.status(400).json({ message: 'Cake quote is not closed or accepted shop mismatch' });
        }

        if (cakeQuote.user_id !== customer_id) {
            await dbTransaction.rollback();
            return res.status(403).json({ message: 'You can only create orders from your own cake quotes' });
        }

        // 3. Check for existing order
        const existingOrder = await CakeOrder.findOne({
            where: { shop_quote_id },
            transaction: dbTransaction
        });
        if (existingOrder) {
            await dbTransaction.rollback();
            return res.status(400).json({ message: 'An order already exists for this shop quote' });
        }

        // 4. Validate delivery_time
        let finalDeliveryTime = delivery_time ? new Date(delivery_time) : null;
        if (finalDeliveryTime) {
            const minDeliveryTime = new Date();
            minDeliveryTime.setHours(minDeliveryTime.getHours() + (shopQuote.preparation_time || 0));
            if (finalDeliveryTime < minDeliveryTime) {
                await dbTransaction.rollback();
                return res.status(400).json({
                    message: `Invalid delivery time. Earliest allowed: ${minDeliveryTime.toISOString()}`
                });
            }
        } else {
            finalDeliveryTime = new Date();
            finalDeliveryTime.setHours(finalDeliveryTime.getHours() + (shopQuote.preparation_time || 0));
        }

        // 5. Set pricing (quoted_price = total_price, others null)
        const total_price = parseFloat(shopQuote.quoted_price);

        // 6. Validate customer's wallet
        const customerWallet = await Wallet.findOne({
            where: { user_id: customer_id },
            transaction: dbTransaction
        });

        if (!customerWallet) {
            await dbTransaction.rollback();
            return res.status(404).json({ message: 'Customer wallet not found' });
        }

        if (parseFloat(customerWallet.balance) < total_price) {
            await dbTransaction.rollback();
            return res.status(400).json({
                message: `Insufficient balance. Current: ${customerWallet.balance}, Required: ${total_price}`
            });
        }

        // 7. Fetch shop wallet
        const shopWallet = await Wallet.findOne({
            where: { user_id: shopQuote.shop.user_id },
            transaction: dbTransaction
        });

        if (!shopWallet) {
            await dbTransaction.rollback();
            return res.status(404).json({ message: 'Shop wallet not found' });
        }

        // 8. Create the order
        const newOrder = await CakeOrder.create({
            customer_id,
            shop_id: shopQuote.shop_id,
            cake_quote_id: cakeQuote.id,
            shop_quote_id: shopQuote.id,
            base_price: total_price, // Set to null
            ingredient_total: null, // Set to null
            total_price,
            size: null, // Set to null
            tier: null, // Set to null
            status: 'pending',
            special_instructions: cakeQuote.special_requirements,
            delivery_time: finalDeliveryTime
        }, { transaction: dbTransaction });

        // 9. Deduct from customer's wallet
        const newCustomerBalance = parseFloat(customerWallet.balance) - total_price;
        await customerWallet.update(
            { balance: newCustomerBalance, updated_at: new Date() },
            { transaction: dbTransaction }
        );

        // 10. Create transaction (held in escrow)
        const paymentTransaction = await Transaction.create({
            from_wallet_id: customerWallet.id,
            to_wallet_id: shopWallet.id,
            order_id: newOrder.id,
            amount: total_price,
            transaction_type: 'order_payment',
            status: 'pending',
            description: `Payment for cake order #${newOrder.id} from quote (held in escrow)`
        }, { transaction: dbTransaction });

        await dbTransaction.commit();

        // 11. Fetch order with details for response
        const orderResponse = await CakeOrder.findByPk(newOrder.id, {
            include: [
                { model: Shop, as: 'shop' },
                { model: CakeQuote, as: 'cakeQuote' },
                { model: ShopQuote, as: 'shopQuote' }
            ]
        });

        res.status(201).json({
            message: 'Cake order created from quote and payment processed successfully',
            order: orderResponse,
            payment: {
                transaction_id: paymentTransaction.id,
                amount_paid: total_price,
                previous_balance: parseFloat(customerWallet.balance),
                new_balance: newCustomerBalance,
                shop_wallet_id: shopWallet.id,
                status: 'held_in_escrow'
            }
        });

    } catch (error) {
        await dbTransaction.rollback();
        console.error('Error creating order from quote:', error);
        res.status(500).json({ message: 'Failed to create order from quote', error: error.message });
    }
};