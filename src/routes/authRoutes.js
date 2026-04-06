// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login } = require('../controllers/authController');
const { forgotPassword, resetPassword } = require('../controllers/authController');

// Validation rules for registration
const registerValidation = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .trim()
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    
    body('email')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    
    body('phone')
        .optional()
        .isMobilePhone().withMessage('Please provide a valid phone number'),
    
    body('address')
        .optional()
        .trim()
];

// Validation rules for login
const loginValidation = [
    body('email')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;