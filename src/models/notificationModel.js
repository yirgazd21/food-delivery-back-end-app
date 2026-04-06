// src/models/Notification.js
const db = require('../config/db');

// Create notification for a user
const create = async (userId, title, message, type = 'order_update') => {
    const [result] = await db.query(
        `INSERT INTO notifications (user_id, title, message, type, is_read) 
         VALUES (?, ?, ?, ?, 0)`,
        [userId, title, message, type]
    );
    return { id: result.insertId, userId, title, message, type, is_read: false };
};

// Get user's notifications (latest first, with unread count)
const getUserNotifications = async (userId) => {
    const [rows] = await db.query(`
        SELECT id, title, message, type, is_read, created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
    `, [userId]);
    
    const [unreadResult] = await db.query(
        'SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = 0',
        [userId]
    );
    
    return {
        notifications: rows,
        unreadCount: unreadResult[0].unread
    };
};

// Mark a notification as read
const markAsRead = async (notificationId, userId) => {
    const [result] = await db.query(
        'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
        [notificationId, userId]
    );
    return result.affectedRows > 0;
};

// Mark all notifications as read
const markAllAsRead = async (userId) => {
    const [result] = await db.query(
        'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
        [userId]
    );
    return result.affectedRows;
};

// Delete read notifications
const deleteRead = async (userId) => {
    const [result] = await db.query(
        'DELETE FROM notifications WHERE user_id = ? AND is_read = 1',
        [userId]
    );
    return result.affectedRows;
};

// Helper: create notification for order status change
const notifyOrderStatusChange = async (orderId, userId, orderStatus) => {
    let title, message;
    switch (orderStatus) {
        case 'confirmed':
            title = 'Order Confirmed';
            message = `Your order #${orderId} has been confirmed and is being prepared.`;
            break;
        case 'preparing':
            title = 'Order Being Prepared';
            message = `Great news! Your order #${orderId} is now being prepared by the kitchen.`;
            break;
        case 'out_for_delivery':
            title = 'Order Out for Delivery';
            message = `Your order #${orderId} is out for delivery and will arrive soon.`;
            break;
        case 'delivered':
            title = 'Order Delivered';
            message = `Your order #${orderId} has been delivered. Enjoy your meal!`;
            break;
        case 'cancelled':
            title = 'Order Cancelled';
            message = `Your order #${orderId} has been cancelled.`;
            break;
        default:
            return null;
    }
    return await create(userId, title, message, 'order_update');
};

module.exports = {
    create,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteRead,
    notifyOrderStatusChange
};