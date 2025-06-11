import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import User from '../models/User.model.js';
import { auth, db } from '../utils/firebase.js';
import 'dotenv/config';

export const register = async (req, res) => {
    const { username, email, password, full_name, avatar } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Validate field lengths
    if (username.length > 100 || email.length > 255 || (full_name && full_name.length > 255)) {
        return res.status(400).json({ message: 'Input data exceeds allowed length.' });
    }

    try {
        // FIRST: Check if username or email already exists in PostgreSQL
        const existingUserByUsername = await User.findOne({ where: { username } });
        if (existingUserByUsername) {
            return res.status(409).json({
                message: 'Username already exists. Please choose a different username.',
                error: 'DUPLICATE_USERNAME'
            });
        }

        const existingUserByEmail = await User.findOne({ where: { email } });
        if (existingUserByEmail) {
            return res.status(409).json({
                message: 'Email already exists. Please choose a different email.',
                error: 'DUPLICATE_EMAIL'
            });
        }

        // SECOND: Create user in Firebase Auth (only after confirming no duplicates)
        const firebaseUser = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUid = firebaseUser.user.uid;

        // THIRD: Hash password for PostgreSQL storage
        const hashedPassword = await bcryptjs.hash(password, 10);

        // FOURTH: Create user in PostgreSQL database
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            full_name: full_name || null,
            avatar: avatar || null,
            is_baker: false,
            is_admin: false,
            firebase_uid: firebaseUid
        });

        // FIFTH: Create user document in Firestore
        await setDoc(doc(db, "users", firebaseUid), {
            username,
            email,
            avatar: avatar || null,
            id: firebaseUid,
            postgresId: user.id,
            blocked: [],
        });

        // SIXTH: Create userchats document in Firestore
        await setDoc(doc(db, "userchats", firebaseUid), {
            chats: [],
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user.dataValues;

        res.status(201).json({
            message: 'User successfully registered!',
            user: userWithoutPassword,
            firebaseUid: firebaseUid
        });
    } catch (err) {
        // Handle Firebase Auth specific errors
        if (err.code === 'auth/email-already-in-use') {
            return res.status(409).json({
                message: 'Email already exists in Firebase Auth.',
                error: 'FIREBASE_EMAIL_EXISTS'
            });
        }
        if (err.code === 'auth/weak-password') {
            return res.status(400).json({
                message: 'Password is too weak. Please choose a stronger password.',
                error: 'WEAK_PASSWORD'
            });
        }
        if (err.code === 'auth/invalid-email') {
            return res.status(400).json({
                message: 'Invalid email format.',
                error: 'INVALID_EMAIL'
            });
        }

        // Handle Sequelize errors (shouldn't happen now, but just in case)
        if (err.name === 'SequelizeUniqueConstraintError') {
            // This should not happen anymore since we check first
            return res.status(409).json({
                message: 'Username or email already exists.',
                error: 'DATABASE_CONSTRAINT_ERROR'
            });
        }

        console.error('Error creating user:', err);
        res.status(500).json({
            message: 'Registration failed',
            error: err.message,
            code: err.code || 'UNKNOWN_ERROR'
        });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        // Authenticate with Firebase
        const firebaseUser = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUid = firebaseUser.user.uid;

        // Find user in PostgreSQL database
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: "User not found in database" });
        }

        // Create JWT token with user information
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                is_admin: user.is_admin,
                is_baker: user.is_baker,
                firebaseUid: firebaseUid
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user.dataValues;

        res.status(200).json({
            message: "Login successful",
            token: token,
            user: userWithoutPassword,
            firebaseUid: firebaseUid
        });
    } catch (err) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        console.error('Login error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const changePassword = async (req, res) => {

};