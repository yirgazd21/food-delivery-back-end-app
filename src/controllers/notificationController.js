// src/controllers/notificationController.js
const Notification = require('../models/notificationModel');

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private (user)
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await Notification.getUserNotifications(userId);
        res.json({ success: true, ...data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private (user)
const markAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user.id;
        const updated = await Notification.markAsRead(notificationId, userId);
        if (!updated) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json({ success: true, message: 'Marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private (user)
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await Notification.markAllAsRead(userId);
        res.json({ success: true, message: `${count} notifications marked as read` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete read notifications
// @route   DELETE /api/notifications
// @access  Private (user)
const deleteRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await Notification.deleteRead(userId);
        res.json({ success: true, message: `Deleted ${count} read notifications` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteRead
};