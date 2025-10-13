 const mongoose = require('mongoose');

const MilkEntrySchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    shift: {
        type: String,
        enum: ['morning', 'evening'],
        required: true,
    },
    quantity: { // in Liters
        type: Number,
        required: true,
    },
    fat: { // in percentage
        type: Number,
        required: true,
    },
    snf: { // Solids-Not-Fat, in percentage
        type: Number,
        required: true,
    },
    rate: { // price per liter
        type: Number,
        required: true,
    },
    amount: { // Calculated: quantity * rate
        type: Number,
        required: true,
    },
}, { 
    timestamps: true,
    // Ensures a customer can't have two entries for the same shift on the same day
    indexes: [{ unique: true, fields: ['customer', 'date', 'shift'] }] 
});

module.exports = mongoose.model('MilkEntry', MilkEntrySchema);