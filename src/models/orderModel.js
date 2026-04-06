// src/models/orderModel.js
const db = require('../config/db'); // now db = pool.promise()

// Create order from cart (using transaction)
const createOrder = async (userId, deliveryAddress, paymentMethod = 'cash') => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const [cartItems] = await connection.query(`
            SELECT ci.food_id, ci.quantity, f.price, f.name
            FROM cart_items ci
            JOIN foods f ON ci.food_id = f.id
            WHERE ci.user_id = ?
        `, [userId]);

        if (cartItems.length === 0) throw new Error('Cart is empty');

        let totalAmount = 0;
        for (const item of cartItems) {
            totalAmount += item.price * item.quantity;
        }

        const [orderResult] = await connection.query(
            `INSERT INTO orders (user_id, total_amount, delivery_address, status, payment_status) 
             VALUES (?, ?, ?, 'pending', 'pending')`,
            [userId, totalAmount, deliveryAddress]
        );
        const orderId = orderResult.insertId;

        for (const item of cartItems) {
            await connection.query(
                `INSERT INTO order_items (order_id, food_id, quantity, price_at_time) 
                 VALUES (?, ?, ?, ?)`,
                [orderId, item.food_id, item.quantity, item.price]
            );
        }

        if (paymentMethod === 'cash') {
            await connection.query(
                `INSERT INTO payments (order_id, user_id, amount, payment_method, payment_status) 
                 VALUES (?, ?, ?, 'cash', 'pending')`,
                [orderId, userId, totalAmount]
            );
        }

        await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

        await connection.commit();
        return { orderId, totalAmount, paymentMethod, status: 'pending', paymentStatus: 'pending' };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Get order by ID with items
const getOrderById = async (orderId, userId = null) => {
    let query = `
        SELECT o.id, o.user_id, o.total_amount, o.delivery_address, o.status, 
               o.payment_status, o.created_at, u.name as user_name, u.email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.id = ?
    `;
    const params = [orderId];
    if (userId) {
        query += ' AND o.user_id = ?';
        params.push(userId);
    }
    const [orders] = await db.query(query, params);
    if (orders.length === 0) return null;

    const order = orders[0];
    const [items] = await db.query(`
        SELECT oi.id, oi.quantity, oi.price_at_time, f.name, f.image_url
        FROM order_items oi
        JOIN foods f ON oi.food_id = f.id
        WHERE oi.order_id = ?
    `, [orderId]);

    order.items = items;
    return order;
};

// Get user's orders
const getUserOrders = async (userId) => {
    const [orders] = await db.query(`
        SELECT id, total_amount, status, payment_status, created_at
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
    `, [userId]);
    return orders;
};

// Update order status (admin)
const updateOrderStatus = async (orderId, status) => {
    const [result] = await db.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, orderId]
    );
    return result.affectedRows > 0;
};

// Update payment status
const updatePaymentStatus = async (orderId, paymentStatus) => {
    const [result] = await db.query(
        'UPDATE orders SET payment_status = ? WHERE id = ?',
        [paymentStatus, orderId]
    );
    if (result.affectedRows > 0) {
        await db.query(
            'UPDATE payments SET payment_status = ? WHERE order_id = ?',
            [paymentStatus, orderId]
        );
    }
    return result.affectedRows > 0;
};

// Get all orders (admin)
const getAllOrders = async () => {
    const [orders] = await db.query(`
        SELECT o.id, o.total_amount, o.status, o.payment_status, o.created_at,
               u.name as user_name, u.email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
    `);
    return orders;
};

module.exports = {
    createOrder,
    getOrderById,
    getUserOrders,
    updateOrderStatus,
    updatePaymentStatus,
    getAllOrders
};