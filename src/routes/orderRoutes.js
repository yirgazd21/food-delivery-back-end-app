// src/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    createOrder,
    getUserOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    updatePaymentStatus
} = require('../controllers/orderController');

// User routes
router.route('/')
    .post(protect, createOrder)
    .get(protect, admin, getAllOrders);  // admin: get all orders

router.get('/my-orders', protect, getUserOrders);
router.get('/:id', protect, getOrderById);

// Admin routes
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/payment', protect, admin, updatePaymentStatus);

module.exports = router;