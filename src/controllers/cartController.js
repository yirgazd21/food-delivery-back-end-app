// src/controllers/cartController.js
const Cart = require('../models/cartModel');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private (user)
const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cartItems = await Cart.getCartByUser(userId);
        const total = await Cart.getCartTotal(userId);
        
        res.json({
            success: true,
            cart: {
                items: cartItems,
                total: parseFloat(total)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private (user)
const addToCart = async (req, res) => {
    try {
        const { foodId, quantity } = req.body;
        const userId = req.user.id;
        
        if (!foodId || !quantity || quantity < 1) {
            return res.status(400).json({ message: 'Food ID and valid quantity required' });
        }
        
        // Optional: Check if food exists and is available
        const db = require('../config/db');
        const [food] = await db.query(
            'SELECT id, is_available FROM foods WHERE id = ?',
            [foodId]
        );
        if (food.length === 0) {
            return res.status(404).json({ message: 'Food not found' });
        }
        if (food[0].is_available === 0) {
            return res.status(400).json({ message: 'Food is not available' });
        }
        
        const result = await Cart.addOrUpdateItem(userId, foodId, quantity);
        
        const cartItems = await Cart.getCartByUser(userId);
        const total = await Cart.getCartTotal(userId);
        
        res.json({
            success: true,
            message: `Item ${result.action} to cart`,
            cart: {
                items: cartItems,
                total: parseFloat(total)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private (user)
const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const cartItemId = req.params.itemId;
        const userId = req.user.id;

        if (quantity === undefined || quantity < 0) {
            return res.status(400).json({ message: 'Valid quantity required' });
        }

        const result = await Cart.updateQuantity(cartItemId, userId, quantity);

        if (result.action === 'not_found') {
            return res.status(404).json({ message: 'Cart item not found or does not belong to user' });
        }

        const cartItems = await Cart.getCartByUser(userId);
        const total = await Cart.getCartTotal(userId);

        res.json({
            success: true,
            message: `Item ${result.action}`,
            cart: {
                items: cartItems,
                total: parseFloat(total)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private (user)
const removeCartItem = async (req, res) => {
    try {
        const cartItemId = req.params.itemId;
        const userId = req.user.id;
        
        const removed = await Cart.removeItem(cartItemId, userId);
        if (!removed) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        
        const cartItems = await Cart.getCartByUser(userId);
        const total = await Cart.getCartTotal(userId);
        
        res.json({
            success: true,
            message: 'Item removed from cart',
            cart: {
                items: cartItems,
                total: parseFloat(total)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private (user)
const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await Cart.clearCart(userId);
        
        res.json({
            success: true,
            message: `Cleared ${count} items from cart`,
            cart: { items: [], total: 0 }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
};