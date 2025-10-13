const express = require('express');
const router = express.Router();

// **THE FIX: Pointing back to the correct PLURAL filename**
const { 
    addMilkEntry, 
    updateMilkEntry,
    getAllCustomers,
    getCustomerSummary,
    addPayment,
    getSessionSummary,
    getCustomerEntriesForAdmin 
} = require('../controllers/adminControllers'); // <-- This now correctly matches your file structure

// Import middleware for security
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

// Apply middleware to all routes in this file.
router.use(protect, isAdmin);

// --- Define all Admin Routes ---
router.post('/milk-entries', addMilkEntry);
router.put('/milk-entries/:id', updateMilkEntry);
router.post('/payments', addPayment);
router.get('/customers', getAllCustomers);
router.get('/customers/:customerId/summary', getCustomerSummary);
router.get('/session-summary', getSessionSummary);

// **THE FIX: The route definition**
router.get('/customers/:customerId/entries', getCustomerEntriesForAdmin);

module.exports = router;

