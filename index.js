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
import shopRoutes from './routes/shop.route.js';
import marketplaceRoutes from './routes/marketplace_post.route.js';

setupAssociations();
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Register the routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/memory-posts', memoryPostRoutes);
app.use('/api/marketplace-posts', marketplaceRoutes);
app.use('/api/shops', shopRoutes);
// Initialize and synchronize the database
initDB().then(() => {
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
    process.exit();
});
