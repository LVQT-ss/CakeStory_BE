import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import setupAssociations from './models/associations.js';
import dotenv from 'dotenv';
import initDB from './database/init.js';
import swaggerDocs from './utils/swagger.js';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import adminRoutes from './routes/admin.route.js';
import memoryPostRoutes from './routes/memory_post.route.js';
import albumRoutes from './routes/album.route.js';
import shopRoutes from './routes/shop.route.js';
import marketplaceRoutes from './routes/marketplace_post.route.js';
import likeRoutes from './routes/like.route.js';
import commentRoutes from './routes/comment.route.js';
import shopMemberRoutes from './routes/shop_member.route.js';
import ingredient from './routes/ingredient.route.js';
import challengeRoutes from './routes/challenge.route.js';
import challengeEntryRoutes from './routes/challengeEntry.routes.js';
import aiGenerateRoutes from './routes/ai_generate.route.js';
import walletRoutes from './routes/wallet.route.js';
import challengePostRoutes from './routes/challenge_post.route.js';
import cakeOrderRoutes from './routes/cakeOrder.route.js';
import cakeDesignRoutes from './routes/cakeDesign.route.js';
import { autoConfirmPendingOrders, autoCompleteShippedOrders, autoUpdateChallengeStatus } from './controllers/scheduler.js';
import complaintRoutes from './routes/complaint.routes.js';
import reviewRoutes from './routes/review.route.js';
import shopGalleryRoutes from './routes/shopGallery.route.js';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/memory-posts', memoryPostRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/marketplace-posts', marketplaceRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/shop-members', shopMemberRoutes);
app.use('/api/ingredients', ingredient);
app.use('/api/challenges', challengeRoutes);
app.use('/api/ai', aiGenerateRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/challenge-entries', challengeEntryRoutes);
app.use('/api/challenge-posts', challengePostRoutes);
app.use('/api/cake-orders', cakeOrderRoutes);
app.use('/api/cake-designs', cakeDesignRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/shop-gallery', shopGalleryRoutes);
// Initialize and synchronize the database
initDB().then(() => {
    // Setup associations after database is initialized

    autoConfirmPendingOrders.start();
    autoCompleteShippedOrders.start();
    autoUpdateChallengeStatus.start();
    console.log('Auto-complete scheduler started');

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
        // Initialize Swagger docs
        swaggerDocs(app, port);
    });
}).catch(error => {
    console.error('Invalid database connection:', error);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Closing PostgreSQL connection');
    autoCompleteShippedOrders.stop();
    console.log('Auto-complete scheduler stopped');
    process.exit();
});
