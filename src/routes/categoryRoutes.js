const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // your multer config
const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin only – with image upload
router.post('/', protect, admin, upload.single('image'), createCategory);
router.put('/:id', protect, admin, upload.single('image'), updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;