// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Protect routes – verify JWT token
const protect = async (req, res, next) => {
    let token;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach user info to request object
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };
        
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// Admin only middleware (must be used after protect)
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: admin only' });
    }
};

// optionalAuth – sets req.user if token exists, but doesn't require it
const optionalAuth = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
        } catch (error) {
            // Invalid token – ignore, user remains unauthenticated
        }
    }
    next();
};

module.exports = { protect, admin, optionalAuth };


