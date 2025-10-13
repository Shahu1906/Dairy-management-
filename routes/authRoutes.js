const express = require('express');
const router = express.Router();
const { register, login, registerAdmin } = require('../controllers/authControllers');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

// @route   POST /api/auth/login
// @access  Public
router.post('/login', login);

// @route   POST /api/auth/register-admin
// @access  Public (for one-time setup)
router.post('/register-admin', registerAdmin);

// @route   POST /api/auth/register
// @access  Private (Admin only)
router.post('/register', protect, isAdmin, register);

module.exports = router;