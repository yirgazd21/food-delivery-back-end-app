// src/controllers/categoryController.js
const Category = require('../models/categoryModel');

// @desc    Get all categories (public)
// @route   GET /api/categories
const getCategories = async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.json({ success: true, categories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single category (public)
// @route   GET /api/categories/:id
const getCategoryById = async (req, res) => {
    try {
        const category = await Category.getById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ success: true, category });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create category (admin only)
// @route   POST /api/categories
const createCategory = async (req, res) => {
    try {
        const { name, description, image_url } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }
        const newCategory = await Category.create({ name, description, image_url });
        res.status(201).json({ success: true, category: newCategory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update category (admin only)
// @route   PUT /api/categories/:id
const updateCategory = async (req, res) => {
    try {
        const { name, description, image_url } = req.body;
        const updated = await Category.update(req.params.id, { name, description, image_url });
        if (!updated) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ success: true, message: 'Category updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete category (admin only)
// @route   DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
    try {
        const deleted = await Category.deleteById(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};