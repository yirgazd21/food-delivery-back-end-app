// src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteRead
} = require('../controllers/notificationController');

router.use(protect); // all routes require login

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.delete('/', deleteRead);
router.put('/:id/read', markAsRead);

module.exports = router;