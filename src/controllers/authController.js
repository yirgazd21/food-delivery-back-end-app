const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const crypto = require('crypto');
const { sendResetEmail } = require('../utils/emailService');
const db= require('../config/db');
const bcrypt = require('bcryptjs');

const generateToken = (userId, email, role) => {
    return jwt.sign(
        { id: userId, email, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, address } = req.body;
    try {
        const existingUser = await userModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = await userModel.createUser({ name, email, password, phone, address });
        const token = generateToken(newUser.id, newUser.email, newUser.role);
        
        res.status(201).json({
            success: true,
            token,
            user: newUser
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        const user = await userModel.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await userModel.verifyPassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user.id, user.email, user.role);
        // Remove password from response
        delete user.password;

        res.json({
            success: true,
            token,
            user
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};



// @desc    Request password reset
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 3600000);

        await db.query(
            'UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?',
            [resetToken, resetExpires, email]
        );

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        
        // TEMPORARY: Log link to console instead of sending email
        console.log('Reset link:', resetLink);
        
        // Optional: still return link in response for easy testing
        res.json({ message: `Reset link (dev only): ${resetLink}` });
        
        // Comment out email sending for now
        // await sendResetEmail(email, resetLink);
        // res.json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password required' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    try {
        const [users] = await db.query(
            'SELECT id FROM users WHERE reset_token = ? AND reset_expires > NOW()',
            [token]
        );
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.query(
            'UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
            [hashedPassword, users[0].id]
        );

        res.json({ message: 'Password reset successful. Please login with your new password.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, login, forgotPassword, resetPassword };