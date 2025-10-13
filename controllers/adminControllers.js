const User = require('../models/User');
const MilkEntry = require('../models/MilkEntry');
const Payment = require('../models/Payment');
const mongoose = require('mongoose');

// @desc    Add a new milk entry for a customer
// @route   POST /api/admin/milk-entries
// @access  Private (Admin Only)
exports.addMilkEntry = async (req, res) => {
    const { customerId, date, shift, quantity, fat, snf, rate } = req.body;

    try {
        const customer = await User.findById(customerId);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        
        const amount = parseFloat(quantity) * parseFloat(rate);

        const entry = await MilkEntry.create({
            customer: customer._id,
            date,
            shift,
            quantity,
            fat,
            snf,
            rate,
            amount
        });

        res.status(201).json({ success: true, data: entry });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'An entry for this customer on this date and shift already exists.' });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Update a milk entry
// @route   PUT /api/admin/milk-entries/:id
// @access  Private (Admin Only)
exports.updateMilkEntry = async (req, res) => {
    try {
        let entry = await MilkEntry.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ success: false, message: 'Milk entry not found' });
        }
        
        const body = { ...req.body };
        if (body.quantity !== undefined || body.rate !== undefined) {
            const newQuantity = body.quantity !== undefined ? body.quantity : entry.quantity;
            const newRate = body.rate !== undefined ? body.rate : entry.rate;
            body.amount = parseFloat(newQuantity) * parseFloat(newRate);
        }

        entry = await MilkEntry.findByIdAndUpdate(req.params.id, body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: entry });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Add a payment for a customer
// @route   POST /api/admin/payments
// @access  Private (Admin Only)
exports.addPayment = async (req, res) => {
    const { customerId, amount, notes } = req.body;
    try {
        const customer = await User.findById(customerId);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const payment = await Payment.create({
            customer: customer._id,
            amount,
            notes
        });

        res.status(201).json({ success: true, data: payment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get all users with the 'customer' role
// @route   GET /api/admin/customers
// @access  Private (Admin Only)
exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await User.find({ role: 'customer' }).select('-password');
        res.status(200).json({ success: true, count: customers.length, data: customers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get financial summary for a specific customer for the last 30 days
// @route   GET /api/admin/customers/:customerId/summary
// @access  Private (Admin Only)
exports.getCustomerSummary = async (req, res) => {
    try {
        const customer = await User.findById(req.params.customerId);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const amountData = await MilkEntry.aggregate([
            { $match: { customer: new mongoose.Types.ObjectId(req.params.customerId), date: { $gte: thirtyDaysAgo } } },
            { $group: { _id: null, totalAmount: { $sum: '$amount' }, totalMilk: { $sum: '$quantity' } } }
        ]);

        const paymentData = await Payment.aggregate([
            { $match: { customer: new mongoose.Types.ObjectId(req.params.customerId), date: { $gte: thirtyDaysAgo } } },
            { $group: { _id: null, totalPaid: { $sum: '$amount' } } }
        ]);

        const totalAmount = amountData.length > 0 ? amountData[0].totalAmount : 0;
        const totalMilk = amountData.length > 0 ? amountData[0].totalMilk : 0;
        const totalPaid = paymentData.length > 0 ? paymentData[0].totalPaid : 0;
        const balance = totalAmount - totalPaid;

        res.status(200).json({
            success: true,
            data: {
                totalMilk: totalMilk.toFixed(2),
                totalAmount: totalAmount.toFixed(2),
                totalPaid: totalPaid.toFixed(2),
                balance: balance.toFixed(2),
                customer: { name: customer.name, customerId: customer.customerId }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get a detailed report of a specific collection session
// @route   GET /api/admin/session-summary
// @access  Private (Admin Only)
exports.getSessionSummary = async (req, res) => {
    const { date, shift } = req.query;

    if (!date || !shift) {
        return res.status(400).json({ success: false, message: 'Please provide both a date and a shift' });
    }

    try {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const summary = await MilkEntry.aggregate([
            {
                $match: {
                    shift: shift,
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'customer',
                    foreignField: '_id',
                    as: 'customerDetails'
                }
            },
            {
                $unwind: '$customerDetails'
            },
            {
                $group: {
                    _id: null,
                    entries: {
                        $push: {
                            customerName: '$customerDetails.name',
                            customerId: '$customerDetails.customerId',
                            quantity: '$quantity',
                            fat: '$fat',
                            rate: '$rate',
                            amount: '$amount'
                        }
                    },
                    totalEntries: { $sum: 1 },
                    totalMilkQuantity: { $sum: '$quantity' },
                    totalAmount: { $sum: '$amount' }
                }
            },
            {
                $project: {
                    _id: 0,
                    entries: 1,
                    totalEntries: 1,
                    totalMilkQuantity: 1,
                    totalAmount: 1
                }
            }
        ]);

        if (summary.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    date: date,
                    shift: shift,
                    entries: [],
                    totalEntries: 0,
                    totalMilkQuantity: 0,
                    totalAmount: 0
                }
            });
        }
        
        res.status(200).json({ 
            success: true, 
            data: {
                date: date,
                shift: shift,
                ...summary[0]
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get all milk entries for a specific customer (for Admin)
// @route   GET /api/admin/customers/:customerId/entries
// @access  Private (Admin Only)
exports.getCustomerEntriesForAdmin = async (req, res) => {
    try {
        const customer = await User.findById(req.params.customerId);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const entries = await MilkEntry.find({ customer: req.params.customerId }).sort({ date: -1 });

        res.status(200).json({ success: true, count: entries.length, data: entries });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};