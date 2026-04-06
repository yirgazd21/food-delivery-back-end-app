// src/controllers/orderController.js
const Order = require('../models/orderModel');

// @desc    Create new order from cart
// @route   POST /api/orders
// @access  Private (user)
const createOrder = async (req, res) => {
    try {
        const { deliveryAddress, paymentMethod } = req.body;
        const userId = req.user.id;

        if (!deliveryAddress) {
            return res.status(400).json({ message: 'Delivery address is required' });
        }

        const order = await Order.createOrder(userId, deliveryAddress, paymentMethod || 'cash');

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order
        });
    } catch (error) {
        console.error(error);
        if (error.message === 'Cart is empty') {
            return res.status(400).json({ message: 'Cart is empty' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private (user)
const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.getUserOrders(userId);
        res.json({ success: true, orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private (user + admin can view any)
const getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        let order;
        if (userRole === 'admin') {
            order = await Order.getOrderById(orderId);
        } else {
            order = await Order.getOrderById(orderId, userId);
        }

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ success: true, order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all orders (admin only)
// @route   GET /api/orders
// @access  Private (admin)
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.getAllOrders();
        res.json({ success: true, orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Private (admin)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updated = await Order.updateOrderStatus(orderId, status);
        if (!updated) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ success: true, message: 'Order status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update payment status (admin)
// @route   PUT /api/orders/:id/payment
// @access  Private (admin)
const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        const orderId = req.params.id;

        const validStatuses = ['pending', 'completed', 'failed'];
        if (!validStatuses.includes(paymentStatus)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }

        const updated = await Order.updatePaymentStatus(orderId, paymentStatus);
        if (!updated) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ success: true, message: 'Payment status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    updatePaymentStatus
};