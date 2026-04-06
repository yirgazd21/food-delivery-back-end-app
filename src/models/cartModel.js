// src/models/Cart.js
const db = require('../config/db');

// Get user's cart with food details
const getCartByUser = async (userId) => {
    const [rows] = await db.query(`
        SELECT ci.id as cart_item_id, ci.quantity,
               f.id as food_id, f.name, f.price, f.image_url
        FROM cart_items ci
        JOIN foods f ON ci.food_id = f.id
        WHERE ci.user_id = ?
        ORDER BY ci.added_at ASC
    `, [userId]);
    return rows;
};

// Add item to cart (or update quantity if exists)
const addOrUpdateItem = async (userId, foodId, quantity) => {
    // Check if item already exists in cart
    const [existing] = await db.query(
        'SELECT id, quantity FROM cart_items WHERE user_id = ? AND food_id = ?',
        [userId, foodId]
    );
    
    if (existing.length > 0) {
        // Update quantity
        const newQuantity = existing[0].quantity + quantity;
        if (newQuantity <= 0) {
            // Remove if quantity becomes zero or negative
            await db.query(
                'DELETE FROM cart_items WHERE id = ?',
                [existing[0].id]
            );
            return { action: 'removed' };
        } else {
            await db.query(
                'UPDATE cart_items SET quantity = ? WHERE id = ?',
                [newQuantity, existing[0].id]
            );
            return { action: 'updated', quantity: newQuantity };
        }
    } else {
        // Insert new item
        if (quantity <= 0) return { action: 'none' };
        const [result] = await db.query(
            'INSERT INTO cart_items (user_id, food_id, quantity) VALUES (?, ?, ?)',
            [userId, foodId, quantity]
        );
        return { action: 'added', id: result.insertId, quantity };
    }
};

// Update quantity of a specific cart item
const updateQuantity = async (cartItemId, userId, quantity) => {
    if (quantity <= 0) {
        const [result] = await db.query(
            'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
            [cartItemId, userId]
        );
        if (result.affectedRows === 0) {
            return { action: 'not_found' };
        }
        return { action: 'removed' };
    } else {
        const [result] = await db.query(
            'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
            [quantity, cartItemId, userId]
        );
        if (result.affectedRows === 0) {
            return { action: 'not_found' };
        }
        return { action: 'updated', quantity };
    }
};

// Remove single item from cart
const removeItem = async (cartItemId, userId) => {
    const [result] = await db.query(
        'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
        [cartItemId, userId]
    );
    return result.affectedRows > 0;
};

// Clear entire cart for a user
const clearCart = async (userId) => {
    const [result] = await db.query(
        'DELETE FROM cart_items WHERE user_id = ?',
        [userId]
    );
    return result.affectedRows;
};

// Get cart total amount
const getCartTotal = async (userId) => {
    const [rows] = await db.query(`
        SELECT SUM(f.price * ci.quantity) as total
        FROM cart_items ci
        JOIN foods f ON ci.food_id = f.id
        WHERE ci.user_id = ?
    `, [userId]);
    return rows[0].total || 0;
};

module.exports = {
    getCartByUser,
    addOrUpdateItem,
    updateQuantity,
    removeItem,
    clearCart,
    getCartTotal
};