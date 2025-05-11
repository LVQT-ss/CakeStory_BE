import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import 'dotenv/config';

export const register = async (req, res) => {
    const { username, email, password, full_name } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Validate field lengths
    if (username.length > 100 || email.length > 255 || (full_name && full_name.length > 255)) {
        return res.status(400).json({ message: 'Input data exceeds allowed length.' });
    }

    try {
        const hashedPassword = await bcryptjs.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            full_name: full_name || null,
            is_baker: false,
            is_admin: false // Default value
        });

        // Remove password from response
        const { password: pass, ...userWithoutPassword } = user.dataValues;

        res.status(201).json({
            message: 'User successfully registered!',
            user: userWithoutPassword
        });
    } catch (err) {
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
            {
                id: user.id,
                username: user.username,
                is_admin: user.is_admin,
                is_baker: user.is_baker
            },
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