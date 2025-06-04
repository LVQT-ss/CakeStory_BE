import User from '../models/User.model.js';
import Following from '../models/following.model.js';

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
                is_Baker: user.is_Baker,
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
            email,
            full_name,
            address,
            phone_number,
            avatar,
            is_Baker
        } = req.body;

        // Find user by ID
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Update user fields if provided
        if (email) user.email = email;
        if (full_name) user.full_name = full_name;
        if (address) user.address = address;
        if (phone_number) user.phone_number = phone_number;
        if (avatar) user.avatar = avatar;
        if (typeof is_Baker === 'boolean') user.is_Baker = is_Baker;

        // Save the updated user
        await user.save();

        // Return success response with updated user data
        return res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                address: user.address,
                phone_number: user.phone_number,
                avatar: user.avatar,
                is_Baker: user.is_Baker
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
