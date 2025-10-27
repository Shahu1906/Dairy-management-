const express = require('express');
const router = express.Router();

// **THE FIX: Add the missing function to the import list**
const { 
    addMilkEntry, 
    updateMilkEntry,
    getAllCustomers,
    getCustomerSummary,
    addPayment,
    getSessionSummary,
    getCustomerEntriesForAdmin,
    getRecentPaymentsSummary // <-- Ensure this is included
} = require('../controllers/adminControllers'); 

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
router.get('/customers/:customerId/entries', getCustomerEntriesForAdmin);

// This route definition is correct, it just needed the import above
router.get('/payments/summary', getRecentPaymentsSummary); 

module.exports = router;

