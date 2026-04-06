// src/controllers/foodController.js
const Food = require('../models/foodModel');

// @desc    Get all foods (public)
// @route   GET /api/foods

const getFoods = async (req, res) => {
    try {
        const { search, category } = req.query;
        const isAdmin = req.user && req.user.role === 'admin';

        const foods = await Food.getAllWithFilters({ search, category }, isAdmin);

        res.json({ success: true, foods });
    } catch (error) {
        console.error('Error in getFoods:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get food by ID (public)
// @route   GET /api/foods/:id
const getFoodById = async (req, res) => {
    try {
        const food = await Food.getById(req.params.id);
        if (!food) {
            return res.status(404).json({ message: 'Food not found' });
        }
        res.json({ success: true, food });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get foods by category (public)
// @route   GET /api/foods/category/:categoryId
const getFoodsByCategory = async (req, res) => {
    try {
        const foods = await Food.getByCategory(req.params.categoryId);
        res.json({ success: true, foods });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create food (admin only) with image upload
// @route   POST /api/foods
const createFood = async (req, res) => {
    try {
        const { name, description, price, category_id, is_available } = req.body;
        let image_url = null;
        
        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        }
        
        if (!name || !price || !category_id) {
            return res.status(400).json({ message: 'Name, price, and category are required' });
        }
        
        const newFood = await Food.create({
            name,
            description,
            price,
            category_id,
            image_url,
            is_available: is_available !== undefined ? is_available : 1
        });
        
        res.status(201).json({ success: true, food: newFood });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update food (admin only)
// @route   PUT /api/foods/:id
const updateFood = async (req, res) => {
    try {
        const { name, description, price, category_id, is_available } = req.body;
        let image_url = req.body.image_url;
        
        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        }
        
        const updated = await Food.update(req.params.id, {
            name,
            description,
            price,
            category_id,
            image_url,
            is_available
        });
        
        if (!updated) {
            return res.status(404).json({ message: 'Food not found' });
        }
        
        res.json({ success: true, message: 'Food updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete food (admin only)
// @route   DELETE /api/foods/:id
const deleteFood = async (req, res) => {
    try {
        const deleted = await Food.deleteById(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Food not found' });
        }
        res.json({ success: true, message: 'Food deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Toggle food availability (admin only)
// @route   PATCH /api/foods/:id/toggle
const toggleAvailability = async (req, res) => {
    try {
        const toggled = await Food.toggleAvailability(req.params.id);
        if (!toggled) {
            return res.status(404).json({ message: 'Food not found' });
        }
        res.json({ success: true, message: 'Availability toggled' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getFoods,
    getFoodById,
    getFoodsByCategory,
    createFood,
    updateFood,
    deleteFood,
    toggleAvailability
};