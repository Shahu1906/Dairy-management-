const MilkEntry = require('../models/MilkEntry');
const Payment = require('../models/Payment');
const mongoose = require('mongoose');

// @desc    Get all milk entries for the currently logged-in customer
exports.getMyEntries = async (req, res) => {
    try {
        const entries = await MilkEntry.find({ customer: req.user.id }).sort({ date: -1 });
        res.status(200).json({ success: true, count: entries.length, data: entries });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get financial summary for the logged-in customer for the last 30 days
exports.getMySummary = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const amountData = await MilkEntry.aggregate([
            { $match: { customer: new mongoose.Types.ObjectId(req.user.id), date: { $gte: thirtyDaysAgo } } },
            { $group: { _id: null, totalAmount: { $sum: '$amount' }, totalMilk: { $sum: '$quantity' } } }
        ]);

        const paymentData = await Payment.aggregate([
            { $match: { customer: new mongoose.Types.ObjectId(req.user.id), date: { $gte: thirtyDaysAgo } } },
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
                balance: balance.toFixed(2)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};