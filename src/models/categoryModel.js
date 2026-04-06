// src/models/Category.js
const db = require('../config/db');

// Get all categories
const getAll = async () => {
    const [rows] = await db.query(
        'SELECT id, name, description, image_url, created_at FROM categories ORDER BY name'
    );
    return rows;
};

// Get category by ID
const getById = async (id) => {
    const [rows] = await db.query(
        'SELECT id, name, description, image_url FROM categories WHERE id = ?',
        [id]
    );
    return rows[0] || null;
};

// Create new category (admin only)
const create = async (categoryData) => {
    const { name, description, image_url } = categoryData;
    const [result] = await db.query(
        'INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)',
        [name, description || null, image_url || null]
    );
    return { id: result.insertId, name, description, image_url };
};

// Update category
const update = async (id, categoryData) => {
    const { name, description, image_url } = categoryData;
    const [result] = await db.query(
        'UPDATE categories SET name = ?, description = ?, image_url = ? WHERE id = ?',
        [name, description || null, image_url || null, id]
    );
    return result.affectedRows > 0;
};

// Delete category
const deleteById = async (id) => {
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

module.exports = { getAll, getById, create, update, deleteById };