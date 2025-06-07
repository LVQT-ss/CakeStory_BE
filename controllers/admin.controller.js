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

