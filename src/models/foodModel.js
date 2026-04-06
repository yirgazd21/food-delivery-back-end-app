// src/models/Food.js
const db = require('../config/db');

// Get all foods (with category name)
const getAll = async () => {
    const [rows] = await db.query(`
        SELECT f.id, f.name, f.description, f.price, f.image_url, f.is_available, 
               c.id as category_id, c.name as category_name
        FROM foods f
        JOIN categories c ON f.category_id = c.id
        WHERE f.is_available = 1
        ORDER BY f.created_at DESC
    `);
    return rows;
};

// Get food by ID
const getById = async (id) => {
    const [rows] = await db.query(`
        SELECT f.id, f.name, f.description, f.price, f.image_url, f.is_available, 
               c.id as category_id, c.name as category_name
        FROM foods f
        JOIN categories c ON f.category_id = c.id
        WHERE f.id = ?
    `, [id]);
    return rows[0] || null;
};

// Get foods by category
const getByCategory = async (categoryId) => {
    const [rows] = await db.query(`
        SELECT id, name, description, price, image_url, is_available
        FROM foods
        WHERE category_id = ? AND is_available = 1
    `, [categoryId]);
    return rows;
};
// New: Get all foods with optional search, category filter, and admin view
const getAllWithFilters = async (filters = {}, isAdmin = false) => {
    const { search, category } = filters;
    let query = `
        SELECT f.id, f.name, f.description, f.price, f.image_url, f.is_available, 
               c.id as category_id, c.name as category_name
        FROM foods f
        JOIN categories c ON f.category_id = c.id
        WHERE 1=1
    `;
    const params = [];

    if (search && search.trim() !== '') {
        query += ` AND f.name LIKE ?`;
        params.push(`%${search}%`);
    }

    if (category && category !== '') {
        query += ` AND f.category_id = ?`;
        params.push(category);
    }

    if (!isAdmin) {
        query += ` AND f.is_available = 1`;
    }

    query += ` ORDER BY f.created_at DESC`;

    const [rows] = await db.query(query, params);
    return rows;
};

// Create new food (admin only)
const create = async (foodData) => {
    const { name, description, price, category_id, image_url, is_available = 1 } = foodData;
    const [result] = await db.query(
        `INSERT INTO foods (name, description, price, category_id, image_url, is_available) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, description || null, price, category_id, image_url || null, is_available]
    );
    return { id: result.insertId, name, description, price, category_id, image_url, is_available };
};

// Update food
const update = async (id, foodData) => {
    const { name, description, price, category_id, image_url, is_available } = foodData;
    const [result] = await db.query(
        `UPDATE foods 
         SET name = ?, description = ?, price = ?, category_id = ?, image_url = ?, is_available = ?
         WHERE id = ?`,
        [name, description || null, price, category_id, image_url || null, is_available, id]
    );
    return result.affectedRows > 0;
};

// Delete food
const deleteById = async (id) => {
    const [result] = await db.query('DELETE FROM foods WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

// Toggle availability
const toggleAvailability = async (id) => {
    const [food] = await db.query('SELECT is_available FROM foods WHERE id = ?', [id]);
    if (!food[0]) return false;
    const newStatus = food[0].is_available === 1 ? 0 : 1;
    const [result] = await db.query(
        'UPDATE foods SET is_available = ? WHERE id = ?',
        [newStatus, id]
    );
    return result.affectedRows > 0;
};

module.exports = { getAll, getById, getByCategory, create, update, deleteById, toggleAvailability, getAllWithFilters };