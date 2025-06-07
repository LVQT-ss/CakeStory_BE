import User from '../models/User.model.js';

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] } // Exclude password from response
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

export const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] } // Exclude password from response
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        return res.status(200).json({
            message: 'User retrieved successfully',
            user: user
        });

    } catch (error) {
        console.error('Error getting user by ID:', error);
        return res.status(500).json({
            message: 'Error getting user by ID',
            error: error.message
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Set isActive to false instead of deleting
        user.is_active = false;
        await user.save();

        return res.status(200).json({
            message: 'User deactivated successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                is_active: user.is_active
            }
        });

    } catch (error) {
        console.error('Error deactivating user:', error);
        return res.status(500).json({
            message: 'Error deactivating user',
            error: error.message
        });
    }
};

