import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import sequelize from '../database/db.js';
import User from '../models/user.model.js';
import UserRole from '../models/userRole.model.js';
import Role from '../models/role.model.js';

// THIS FUNCTION IS FOR SIGNUP A STAFF ACCOUNT IN THE SYSTEM 
export const register = async (req, res) => {
    const { roleId, username, email, password, userAddress, userPhoneNumber } = req.body;

    if (!roleId || !username || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Validate role ID exists
    try {
        const role = await Role.findByPk(roleId);
        if (!role) {
            return res.status(400).json({ message: 'Invalid role ID.' });
        }

        // For security, you might want to restrict which roles can be assigned through registration
        // For example, only Customer (7) and Service Partner (6) are allowed for public registration
        const publicRoles = [6, 7]; // Customer and Service Partner
        if (!publicRoles.includes(roleId) && req.user?.roleId !== 1) { // Allow admin to create any role
            return res.status(403).json({ message: 'You do not have permission to create this type of account.' });
        }
    } catch (err) {
        return res.status(500).json({ message: 'Error validating role.', error: err.message });
    }

    if (username.length > 50 || email.length > 50 || password.length > 50 ||
        (userAddress && userAddress.length > 255) ||
        (userPhoneNumber && userPhoneNumber.length > 50)) {
        return res.status(400).json({ message: 'Input data exceeds allowed length.' });
    }

    // Start transaction
    const t = await sequelize.transaction();

    try {
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            userAddress: userAddress || null,
            userPhoneNumber: userPhoneNumber || null,
            userStatus: 'active'
        }, { transaction: t });

        // Assign role to user
        await UserRole.create({
            userId: user.userId,
            roleId: roleId,
            assignedAt: new Date(),
            assignedBy: req.user?.userId || user.userId, // If admin is creating, use admin ID, otherwise self-assign
        }, { transaction: t });

        await t.commit();

        // Don't send password back in response
        const userData = { ...user.get(), password: undefined };

        res.status(201).json({
            message: 'User successfully registered!',
            user: userData
        });
    } catch (err) {
        await t.rollback();

        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Username or email already exists. Please choose a different one.' });
        }

        console.error('Error creating user:', err);
        res.status(500).send(err.message);
    }
};

export const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const passwordMatch = await bcryptjs.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { id: user.userId, userType: user.usertype },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        const { password: pass, ...userWithoutPassword } = user.dataValues;

        res.status(200).json({
            message: "Login successful",
            token: token,
            user: userWithoutPassword,
        });

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
