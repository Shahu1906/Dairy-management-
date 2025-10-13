const express = require('express');
const router = express.Router();

// Correctly import the controller functions from 'customerControllers.js'
const { 
    getMyEntries, 
    getMySummary 
} = require('../controllers/customerControllers'); // <-- FIX IS HERE

// Import the 'protect' middleware
const { protect } = require('../middleware/authMiddleware');

// Apply the 'protect' middleware to all routes in this file.
// This ensures that only a logged-in user (either a customer or an admin)
// can access these endpoints.
router.use(protect);

// --- Define the Customer-Specific Routes ---

// @desc    Get all milk entries for the logged-in user
// @route   GET /api/customer/my-entries
// @access  Private
router.get('/my-entries', getMyEntries);

// @desc    Get the financial summary for the logged-in user
// @route   GET /api/customer/my-summary
// @access  Private
router.get('/my-summary', getMySummary);

module.exports = router;