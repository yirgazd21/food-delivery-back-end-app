const db = require('../config/db');
const bcrypt = require('bcryptjs');

const findByEmail = async (email) => {
    const [rows] = await db.query(
        'SELECT id, name, email, password, role, phone, address FROM users WHERE email = ?',
        [email]
    );
    return rows[0] || null;
};

const findById = async (id) => {
    const [rows] = await db.query(
        'SELECT id, name, email, role, phone, address, created_at FROM users WHERE id = ?',
        [id]
    );
    return rows[0] || null;
};

const createUser = async (userData) => {
    const { name, email, password, phone, address, role = 'user' } = userData;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.query(
        `INSERT INTO users (name, email, password, phone, address, role) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, phone || null, address || null, role]
    );
    return { id: result.insertId, name, email, role, phone, address };
};

const verifyPassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = { findByEmail, findById, createUser, verifyPassword };