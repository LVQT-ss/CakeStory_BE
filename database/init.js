// src/database/init.js
import sequelize from './db.js';
// Import tất cả model cần thiết
import User from '../models/User.model.js';
import Shop from '../models/shop.model.js';
import Post from '../models/post.model.js';
import MemoryPost from '../models/memory_post.model.js';
import MarketplacePost from '../models/marketplace_post.model.js';
import PostData from '../models/post_data.model.js';
import Album from '../models/album.model.js';
import AlbumPost from '../models/album_post.model.js';
import CakeDesign from '../models/cake_design.model.js';
import Group from '../models/group.model.js';
import GroupMember from '../models/group_member.model.js';
import GroupPost from '../models/group_post.model.js';
import Comment from '../models/comment.model.js';
import Like from '../models/like.model.js';
import Following from '../models/following.model.js';
import Challenge from '../models/challenge.model.js';
import ChallengePost from '../models/challenge_post.model.js';
import ChallengeEntry from '../models/challenge_entry.model.js';
import CakeOrder from '../models/cake_order.model.js';
import Review from '../models/review.model.js';
import Transaction from '../models/transaction.model.js';
import AiGeneratedImage from '../models/ai_generated_image.model.js';
import Wallet from '../models/wallet.model.js';
import DepositRecords from '../models/deposit_records.model.js';
import WithdrawRecords from '../models/withdraw_records.model.js';
import ShopMember from '../models/shop_member.model.js';
import Ingredient from '../models/Ingredient.model.js';
const initDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');

        // Đồng bộ các mô hình với cơ sở dữ liệu
        await sequelize.sync({ alter: true });
        console.log('Database synchronized.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

export default initDB;
