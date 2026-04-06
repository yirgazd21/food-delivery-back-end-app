// src/routes/foodRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
    getFoods,
    getFoodById,
    getFoodsByCategory,
    createFood,
    updateFood,
    deleteFood,
    toggleAvailability
} = require('../controllers/foodController');
const { optionalAuth } = require('../middleware/authMiddleware');

// Public routes
router.get('/', optionalAuth, getFoods);
router.get('/:id', optionalAuth, getFoodById);


// Admin only routes (with image upload)
router.post('/', protect, admin, upload.single('image'), createFood);
router.put('/:id', protect, admin, upload.single('image'), updateFood);
router.delete('/:id', protect, admin, deleteFood);
router.patch('/:id/toggle', protect, admin, toggleAvailability);

module.exports = router;