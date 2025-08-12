import User from '../models/User.model.js';
import Following from '../models/following.model.js';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase.js';

export const followUser = async (req, res) => {
    try {
        const followerId = req.userId; // Get the authenticated user's ID from verifyToken middleware
        const followedId = req.params.id; // Get the user to follow from URL params

        // Check if trying to follow self
        if (followerId === followedId) {
            return res.status(400).json({
                message: 'You cannot follow yourself'
            });
        }

        // Check if both users exist
        const [follower, followed] = await Promise.all([
            User.findByPk(followerId),
            User.findByPk(followedId)
        ]);

        if (!follower || !followed) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Check if follow relationship already exists
        const existingFollow = await Following.findOne({
            where: {
                follower_id: followerId,
                followed_id: followedId
            }
        });

        if (existingFollow) {
            // Unfollow
            await existingFollow.destroy();
            return res.status(200).json({
                message: 'Successfully unfollowed user',
                isFollowing: false
            });
        } else {
            // Follow
            await Following.create({
                follower_id: followerId,
                followed_id: followedId
            });
            return res.status(200).json({
                message: 'Successfully followed user',
                isFollowing: true
            });
        }

    } catch (error) {
        console.error('Error in follow/unfollow operation:', error);
        return res.status(500).json({
            message: 'Error in follow/unfollow operation',
            error: error.message
        });
    }
};

export const unfollowUser = async (req, res) => {
    try {
        const followerId = req.userId;
        const followedId = req.params.id;

        // Check if trying to unfollow self
        if (followerId === followedId) {
            return res.status(400).json({
                message: 'You cannot unfollow yourself'
            });
        }

        // Check if both users exist
        const [follower, followed] = await Promise.all([
            User.findByPk(followerId),
            User.findByPk(followedId)
        ]);

        if (!follower || !followed) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Check if follow relationship exists
        const existingFollow = await Following.findOne({
            where: {
                follower_id: followerId,
                followed_id: followedId
            }
        });

        if (!existingFollow) {
            return res.status(400).json({
                message: 'You are not following this user'
            });
        }

        // Unfollow
        await existingFollow.destroy();
        return res.status(200).json({
            message: 'Successfully unfollowed user',
            isFollowing: false
        });

    } catch (error) {
        console.error('Error in unfollow operation:', error);
        return res.status(500).json({
            message: 'Error in unfollow operation',
            error: error.message
        });
    }
};

export const viewProfile = async (req, res) => {
    try {
        const userId = req.params.id;

        // Find user by ID
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] } // Exclude sensitive data
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Return user profile data
        return res.status(200).json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                address: user.address,
                phone_number: user.phone_number,
                avatar: user.avatar,
                role: user.role,
                created_at: user.created_at,
                updated_at: user.updated_at
            }
        });

    } catch (error) {
        console.error('Error viewing profile:', error);
        return res.status(500).json({
            message: 'Error viewing profile',
            error: error.message
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.params.id; // Get user ID from request parameters
        const {
            full_name,
            address,
            phone_number,
            avatar,
        } = req.body;

        // Find user by ID
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Track if avatar is being updated
        const isAvatarUpdated = avatar && avatar !== user.avatar;

        // Update user fields if provided
        if (full_name) user.full_name = full_name;
        if (address) user.address = address;
        if (phone_number) user.phone_number = phone_number;
        if (avatar) user.avatar = avatar;

        // Save the updated user
        await user.save();

        // Update avatar in Firebase Firestore if it was changed
        if (isAvatarUpdated && user.firebase_uid) {
            try {
                const userDocRef = doc(db, "users", user.firebase_uid);
                await updateDoc(userDocRef, {
                    avatar: avatar
                });
            } catch (firebaseError) {
                console.error('Error updating avatar in Firebase:', firebaseError);
                // Don't fail the entire operation if Firebase update fails
                // Just log the error and continue
            }
        }

        // Return success response with updated user data
        return res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                address: user.address,
                phone_number: user.phone_number,
                avatar: user.avatar,
            }
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({
            message: 'Error updating profile',
            error: error.message
        });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            where: {
                is_active: true
            },
            attributes: {
                exclude: ['password', 'firebase_uid'] // Exclude sensitive data
            }
        });

        return res.status(200).json({
            message: 'Users retrieved successfully',
            users: users
        });

    } catch (error) {
        console.error('Error getting all users:', error);
        return res.status(500).json({
            message: 'Error getting all users',
            error: error.message
        });
    }
};

export const getFollowing = async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Get all users that this user follows
        const following = await Following.findAll({
            where: {
                follower_id: userId
            },
            include: [{
                model: User,
                as: 'followed',
                attributes: ['id', 'username', 'full_name', 'avatar', 'role']
            }],
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            message: 'Following list retrieved successfully',
            following: following.map(follow => follow.followed),
            totalFollowing: following.length
        });

    } catch (error) {
        console.error('Error getting following list:', error);
        return res.status(500).json({
            message: 'Error getting following list',
            error: error.message
        });
    }
};

export const getFollowers = async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Get all followers
        const followers = await Following.findAll({
            where: {
                followed_id: userId
            },
            include: [{
                model: User,
                as: 'follower',
                attributes: ['id', 'username', 'full_name', 'avatar', 'role']
            }],
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            message: 'Followers retrieved successfully',
            followers: followers.map(follow => follow.follower),
            totalFollowers: followers.length
        });

    } catch (error) {
        console.error('Error getting followers:', error);
        return res.status(500).json({
            message: 'Error getting followers',
            error: error.message
        });
    }
};