const express = require("express");
const router = express.Router();

// Import all necessary controller functions, including the new one
const {
  addMilkEntry,
  updateMilkEntry,
  getAllCustomers,
  getCustomerSummary,
  addPayment,
  getSessionSummary,
} = require("../controllers/adminControllers"); // Corrected path from debugging

// Import middleware for security
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const {
  // ... (your existing imports)
  getCustomerEntriesForAdmin,
} = require("../controllers/adminControllers");

// Apply 'protect' and 'isAdmin' middleware to all routes in this file.
// This ensures only authenticated admins can access these endpoints.
router.use(protect, isAdmin);

// --- Define all Admin Routes ---

// Routes for managing milk entries
router.post("/milk-entries", addMilkEntry);
router.put("/milk-entries/:id", updateMilkEntry);

// Route for managing payments
router.post("/payments", addPayment);

// Routes for managing and viewing customer data
router.get("/customers", getAllCustomers);
router.get("/customers/:customerId/summary", getCustomerSummary);

// Route for getting the new detailed session report
router.get("/session-summary", getSessionSummary);
router.get('/customers/:customerId/entries', getCustomerEntriesForAdmin);
module.exports = router;
