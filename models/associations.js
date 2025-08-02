import User from "./User.model.js";
import Shop from "./shop.model.js";
import Post from "./post.model.js";
import MemoryPost from "./memory_post.model.js";
import MarketplacePost from "./marketplace_post.model.js";
import PostData from "./post_data.model.js";
import Album from "./album.model.js";
import CakeDesign from "./cake_design.model.js";
import CakeDesignDetail from "./cake_design_detail.model.js";
import Group from "./group.model.js";
import GroupMember from "./group_member.model.js";
import Comment from "./comment.model.js";
import Like from "./like.model.js";
import Following from "./following.model.js";
import Challenge from "./challenge.model.js";
import ChallengePost from "./challenge_post.model.js";
import ChallengeEntry from "./challenge_entry.model.js";
import CakeOrder from "./cake_order.model.js";
import Review from "./review.model.js";
import Transaction from "./transaction.model.js";
import Subscription from "./subscription.model.js";
import AlbumPost from './album_post.model.js';
import GroupPost from './group_post.model.js';
import ShopMember from "./shop_member.model.js";
import Ingredient from './Ingredient.model.js';
import AiGeneratedImage from "./ai_generated_image.model.js";
import Wallet from "./wallet.model.js";
import DepositRecords from "./deposit_records.model.js";
import OrderDetail from "./order_detail.model.js";
function setupAssociations() {
  // User ↔ Shop (1-1)
  User.hasOne(Shop, { foreignKey: "user_id", as: "shop", onDelete: "CASCADE" });
  Shop.belongsTo(User, { foreignKey: "user_id", as: "user" });

  // User ↔ Post (1-N)
  User.hasMany(Post, { foreignKey: "user_id", as: "posts" });
  Post.belongsTo(User, { foreignKey: "user_id", as: "user" });

  // Post ↔ PostData (1-N)
  Post.hasMany(PostData, { foreignKey: "post_id", as: "media" });
  PostData.belongsTo(Post, { foreignKey: "post_id" });

  // Post ↔ MemoryPost (1-1)
  Post.hasOne(MemoryPost, { foreignKey: "post_id" });
  MemoryPost.belongsTo(Post, { foreignKey: "post_id" });

  // User ↔ Album (1-N)
  User.hasMany(Album, { foreignKey: "user_id" });
  Album.belongsTo(User, { foreignKey: "user_id" });

  // Post ↔ MarketplacePost (1-1)
  Post.hasOne(MarketplacePost, { foreignKey: 'post_id', as: 'marketplacePost' });
  MarketplacePost.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

  // Shop ↔ ShopMember (1-N)
  Shop.hasMany(ShopMember, { foreignKey: "shop_id", as: "members" });
  ShopMember.belongsTo(Shop, { foreignKey: "shop_id" });

  // User ↔ ShopMember (1-N)
  User.hasMany(ShopMember, { foreignKey: "user_id", as: "shopMemberships" });
  ShopMember.belongsTo(User, { foreignKey: "user_id" });

  // User ↔ CakeDesign (1-N)
  User.hasMany(CakeDesign, { foreignKey: "user_id" });
  CakeDesign.belongsTo(User, { foreignKey: "user_id" });

  // CakeDesign ↔ CakeDesignDetail (1-N)
  CakeDesign.hasMany(CakeDesignDetail, { foreignKey: "cake_design_id" });
  CakeDesignDetail.belongsTo(CakeDesign, { foreignKey: "cake_design_id" });

  // Group ↔ GroupMember (1-N)
  Group.hasMany(GroupMember, { foreignKey: "group_id" });
  GroupMember.belongsTo(Group, { foreignKey: "group_id" });

  // User ↔ GroupMember (1-N)
  User.hasMany(GroupMember, { foreignKey: "user_id" });
  GroupMember.belongsTo(User, { foreignKey: "user_id" });

  // Post ↔ Comment (1-N)
  Post.hasMany(Comment, { foreignKey: "post_id" });
  Comment.belongsTo(Post, { foreignKey: "post_id" });

  // User ↔ Comment (1-N)
  User.hasMany(Comment, { foreignKey: "user_id" });
  Comment.belongsTo(User, { foreignKey: "user_id" });

  // Self-referential association for comment replies
  Comment.hasMany(Comment, { foreignKey: 'parent_comment_id', as: 'replies' });
  Comment.belongsTo(Comment, { foreignKey: 'parent_comment_id', as: 'parent' });

  // Like - flexible association
  Post.hasMany(Like, { foreignKey: "post_id" });
  CakeDesign.hasMany(Like, { foreignKey: "design_id" });
  Like.belongsTo(Post, { foreignKey: "post_id" });
  Like.belongsTo(CakeDesign, { foreignKey: "design_id" });

  // User ↔ Like (1-N)
  User.hasMany(Like, { foreignKey: "user_id" });
  Like.belongsTo(User, { foreignKey: "user_id" });

  // Following - self-association
  User.hasMany(Following, { foreignKey: "follower_id", as: "following" });
  User.hasMany(Following, { foreignKey: "followed_id", as: "followers" });
  Following.belongsTo(User, { foreignKey: "follower_id", as: "follower" });
  Following.belongsTo(User, { foreignKey: "followed_id", as: "followed" });

  // Challenge ↔ ChallengePost (1-N)
  Challenge.hasMany(ChallengePost, { foreignKey: "challenge_id" });
  ChallengePost.belongsTo(Challenge, { foreignKey: "challenge_id" });

  // ✅ FIXED: Post ↔ ChallengePost (1-1) with alias
  Post.hasOne(ChallengePost, { foreignKey: "post_id", as: "challengePost" });
  ChallengePost.belongsTo(Post, { foreignKey: "post_id", as: "post" });

  // Challenge ↔ ChallengeEntry (1-1)
  Challenge.hasOne(ChallengeEntry, { foreignKey: "challenge_id" });
  ChallengeEntry.belongsTo(Challenge, { foreignKey: "challenge_id" });

  // User ↔ ChallengeEntry (1-N)
  User.hasMany(ChallengeEntry, { foreignKey: "user_id" });
  ChallengeEntry.belongsTo(User, { foreignKey: "user_id" });

  // CakeOrder associations
  User.hasMany(CakeOrder, { foreignKey: "customer_id", as: "orders" });
  Shop.hasMany(CakeOrder, { foreignKey: "shop_id" });
  CakeDesign.hasMany(CakeOrder, { foreignKey: "design_id" });
  MarketplacePost.hasMany(CakeOrder, { foreignKey: "marketplace_post_id" });
  CakeOrder.belongsTo(User, { foreignKey: "customer_id" });
  CakeOrder.belongsTo(Shop, { foreignKey: "shop_id" });
  CakeOrder.belongsTo(CakeDesign, { foreignKey: "design_id" });
  CakeOrder.belongsTo(MarketplacePost, { foreignKey: "marketplace_post_id" });

  // CakeOrder ↔ Review (1-1)
  CakeOrder.hasOne(Review, { foreignKey: "order_id" });
  Review.belongsTo(CakeOrder, { foreignKey: "order_id" });

  // User ↔ Transaction (1-N)
  User.hasMany(Transaction, { foreignKey: "user_id" });
  Transaction.belongsTo(User, { foreignKey: "user_id" });

  // Transaction ↔ Subscription (1-1)
  Transaction.hasOne(Subscription, { foreignKey: "Transaction_id" });
  Subscription.belongsTo(Transaction, { foreignKey: "Transaction_id" });

  // Album ↔ AlbumPost (1-N)
  Album.hasMany(AlbumPost, { foreignKey: "album" });
  AlbumPost.belongsTo(Album, { foreignKey: "album" });

  // Post ↔ AlbumPost (1-1)
  Post.hasOne(AlbumPost, { foreignKey: "post_id" });
  AlbumPost.belongsTo(Post, { foreignKey: "post_id" });

  // Group ↔ GroupPost (1-N)
  Group.hasMany(GroupPost, { foreignKey: "group_id" });
  GroupPost.belongsTo(Group, { foreignKey: "group_id" });

  // Post ↔ GroupPost (1-1)
  Post.hasOne(GroupPost, { foreignKey: "post_id" });
  GroupPost.belongsTo(Post, { foreignKey: "post_id" });

  // Shop ↔ CakeDesign (1-N)
  Shop.hasMany(CakeDesign, { foreignKey: "shop_id" });
  CakeDesign.belongsTo(Shop, { foreignKey: "shop_id" });

  // User ↔ MarketplacePost (1-N)
  User.hasMany(MarketplacePost, { foreignKey: "user_id" });
  MarketplacePost.belongsTo(User, { foreignKey: "user_id" });

  // MarketplacePost ↔ Shop (N-1)
  MarketplacePost.belongsTo(Shop, { foreignKey: 'shop_id', as: 'shop' });
  Shop.hasMany(MarketplacePost, { foreignKey: 'shop_id', as: 'marketplacePosts' });

  // Ingredient ↔ Shop (N-1)
  Ingredient.belongsTo(Shop, { foreignKey: 'shop_id', as: 'shop' });
  Shop.hasMany(Ingredient, { foreignKey: 'shop_id', as: 'ingredients' });

  // User ↔ AiGeneratedImage (1-N)
  User.hasMany(AiGeneratedImage, { foreignKey: "user_id" });
  AiGeneratedImage.belongsTo(User, { foreignKey: "user_id" });

  // User ↔ Wallet (1-1)
  User.hasOne(Wallet, { foreignKey: "user_id" });
  Wallet.belongsTo(User, { foreignKey: "user_id" });

  // User ↔ DepositRecords (1-1)
  User.hasOne(DepositRecords, { foreignKey: "user_id" });
  DepositRecords.belongsTo(User, { foreignKey: "user_id" });

  // CakeOrder ↔ OrderDetail (1-N)
CakeOrder.hasMany(OrderDetail, { foreignKey: "order_id", as: "orderDetails" });
OrderDetail.belongsTo(CakeOrder, { foreignKey: "order_id", as: "order" });

// Ingredient ↔ OrderDetail (1-N)
Ingredient.hasMany(OrderDetail, { foreignKey: "ingredient_id", as: "orderDetails" });
OrderDetail.belongsTo(Ingredient, { foreignKey: "ingredient_id", as: "ingredient" });
}

export default setupAssociations;
