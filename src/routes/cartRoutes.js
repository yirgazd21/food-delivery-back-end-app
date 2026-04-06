// src/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
} = require('../controllers/cartController');

// All cart routes require authentication
router.use(protect);

router.route('/')
    .get(getCart)
    .post(addToCart)
    .delete(clearCart);

router.route('/:itemId')
    .put(updateCartItem)
    .delete(removeCartItem);

module.exports = router;